import { isAuthenticated } from '@/lib/actions/auth.actoion'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated() // Replace with actual authentication logic
  if (isUserAuthenticated) redirect('/')
  return (
    <div className='auth-layout'>{children}</div>
  )
}

export default AuthLayout