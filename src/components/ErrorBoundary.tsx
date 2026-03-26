// ERROR BOUNDARY: Captura errores de render en cualquier componente hijo.
// Sin esto, un crash en cualquier parte del árbol deja pantalla en blanco.
// Con esto, muestra un mensaje útil con botón para recargar.
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#010C23',
            color: '#ffffff',
            fontFamily: 'system-ui, sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Catarsis Drinks &amp; Food
          </h1>
          <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>
            Estamos teniendo un problema técnico. Por favor recarga la página.
          </p>
          <button
            onClick={() => {
              // Limpiar storage potencialmente corrupto y recargar
              localStorage.removeItem('catarsis_cart');
              window.location.reload();
            }}
            style={{
              backgroundColor: '#DB1F51',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            aria-label="Recargar página"
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
