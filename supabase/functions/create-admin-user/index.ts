import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Protected admin user IDs (cannot be deleted)
const PROTECTED_ADMIN_IDS = [
  'd86e2bb0-fcfb-4b38-8a12-e18b43dcc040', // catarsismkt2024@gmail.com
  '46bca2b3-4491-48b8-91f9-89a99b7e1936'  // infoadrianmorales@gmail.com
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user's auth
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Validate JWT and get user claims
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      console.log('Invalid token:', claimsError?.message)
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub as string
    console.log('Authenticated user:', userId)

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if the caller is an admin
    const { data: isAdminData, error: roleError } = await supabaseAdmin
      .rpc('is_admin', { _user_id: userId })

    if (roleError || !isAdminData) {
      console.log('User is not admin:', roleError?.message)
      return new Response(
        JSON.stringify({ error: 'Solo administradores pueden gestionar usuarios' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { action, email, password, user_id } = await req.json()

    // Handle different actions
    if (action === 'list') {
      // List all admin users
      const { data: roles, error: listError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role, created_at')
        .order('created_at', { ascending: true })

      if (listError) {
        console.log('Error listing roles:', listError.message)
        return new Response(
          JSON.stringify({ error: listError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user details for each role
      const usersWithDetails = await Promise.all(
        roles.map(async (role) => {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(role.user_id)
          return {
            id: role.user_id,
            email: userData?.user?.email || 'Unknown',
            role: role.role,
            created_at: role.created_at,
            is_protected: PROTECTED_ADMIN_IDS.includes(role.user_id)
          }
        })
      )

      return new Response(
        JSON.stringify({ users: usersWithDetails }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'create') {
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email y contraseña son requeridos' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Creating admin user:', email)

      // Create user with admin API
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (createError) {
        console.log('Error creating user:', createError.message)
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Add admin role
      const { error: roleInsertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: 'admin'
        })

      if (roleInsertError) {
        console.log('Error adding role:', roleInsertError.message)
        return new Response(
          JSON.stringify({ error: roleInsertError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Admin user created successfully:', userData.user.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuario administrador creado exitosamente',
          user_id: userData.user.id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'delete') {
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'ID de usuario requerido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user is protected
      if (PROTECTED_ADMIN_IDS.includes(user_id)) {
        console.log('Attempted to delete protected admin:', user_id)
        return new Response(
          JSON.stringify({ error: 'Este usuario está protegido y no puede ser eliminado' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Deleting user:', user_id)

      // Delete from user_roles first
      const { error: roleDeleteError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)

      if (roleDeleteError) {
        console.log('Error deleting role:', roleDeleteError.message)
        return new Response(
          JSON.stringify({ error: roleDeleteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Delete user from auth
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)

      if (deleteError) {
        console.log('Error deleting user:', deleteError.message)
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('User deleted successfully:', user_id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuario eliminado exitosamente'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default: legacy create behavior (backward compatibility)
    if (email && password && !action) {
      console.log('Legacy create mode for:', email)
      
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: roleInsertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: 'admin'
        })

      if (roleInsertError) {
        return new Response(
          JSON.stringify({ error: roleInsertError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuario administrador creado exitosamente',
          user_id: userData.user.id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Acción no válida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Unexpected error:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
