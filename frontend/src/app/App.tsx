import { useState } from 'react'
import { RegisterPage } from './screens/auth/RegisterPage'

type Screen = 'register' | 'login'

function App() {
  const [screen, setScreen] = useState<Screen>('register')

  const handleSuccess = (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    // TODO: navegar para dashboard
    alert('Conta criada com sucesso!')
  }

  if (screen === 'register') {
    return (
      <RegisterPage
        onSuccess={handleSuccess}
        onSwitchToLogin={() => setScreen('login')}
      />
    )
  }

  // placeholder para login
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <button
          onClick={() => setScreen('register')}
          className="text-primary underline"
        >
          Criar conta
        </button>
      </div>
    </div>
  )
}

export default App