import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import Auth from './Auth'

import { customRender } from '../../utils/test-utils'

const BASE_AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts/'

const testUserData = {
  email: 'test@email.com',
  displayName: 'Name',
  password: 'Password',
}

const server = setupServer(
  rest.post(`${BASE_AUTH_URL}:signInWithPassword`, (_, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        localId: 'localId',
        email: testUserData.email,
        displayName: testUserData.displayName,
        idToken: 'authToken',
        refreshToken: 'refreshToken',
        expiresIn: 'timestamp',
      })
    )
  }),
  rest.post(`${BASE_AUTH_URL}:signUp`, (_, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        localId: 'localId',
        email: testUserData.email,
        displayName: testUserData.displayName,
        idToken: 'authToken',
        refreshToken: 'refreshToken',
        expiresIn: 'timestamp',
      })
    )
  })
)

const mockedUsedNavigate = jest.fn()

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockedUsedNavigate,
}))

describe('<Auth />', () => {
  beforeAll(() => server.listen())

  afterEach(() => server.resetHandlers())

  afterAll(() => server.close())

  test('should change auth mode', () => {
    // Given
    customRender(<Auth />)
    expect(screen.getByText(/really hungry?/i)).toBeInTheDocument()
    const changeAuthModeBtn = screen.getByText(/sign up!/i)

    // When
    userEvent.click(changeAuthModeBtn)

    // Then
    expect(screen.queryByText(/really hungry?/i)).not.toBeInTheDocument()
    expect(screen.getByText(/create a new account/i)).toBeInTheDocument()
  })

  test('should update email, name and password', () => {
    // Given
    customRender(<Auth />)
    const changeAuthModeBtn = screen.getByText(/sign up!/i)

    // When
    userEvent.click(changeAuthModeBtn)

    const emailInput = screen.getByLabelText(
      /e-mail address/i
    ) as HTMLInputElement
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    userEvent.type(emailInput, testUserData.email)
    userEvent.type(nameInput, testUserData.displayName)
    userEvent.type(passwordInput, testUserData.password)

    // Then
    expect(emailInput.value).toBe(testUserData.email)
    expect(nameInput.value).toBe(testUserData.displayName)
    expect(passwordInput.value).toBe(testUserData.password)
  })

  test('should sign in user in login mode', async () => {
    // Given
    customRender(<Auth />)

    const emailInput = screen.getByLabelText(/e-mail address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByText(/sign in/i)

    // When
    userEvent.type(emailInput, testUserData.email)
    userEvent.type(passwordInput, testUserData.password)
    userEvent.click(signInButton)

    // Then
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalled())
  })

  test('should sign up a user in register mode', async () => {
    // Given
    customRender(<Auth />)
    const changeAuthModeBtn = screen.getByText(/sign up!/i)

    // When
    userEvent.click(changeAuthModeBtn)

    const emailInput = screen.getByLabelText(/e-mail address/i)
    const nameInput = screen.getByLabelText(/name/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signUpButton = screen.getByText(/create account/i)

    userEvent.type(emailInput, testUserData.email)
    userEvent.type(nameInput, testUserData.displayName)
    userEvent.type(passwordInput, testUserData.password)
    userEvent.click(signUpButton)

    // Then
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalled())
  })

  test('should catch an error while authenticating', () => {
    // Given
    customRender(<Auth />)

    server.use(
      rest.post(
        'https://identitytoolkit.googleapis.com/v1/accounts/:signInWithPassword',
        (_, res, ctx) => {
          return res(ctx.status(401))
        }
      )
    )

    const emailInput = screen.getByLabelText(/e-mail address/i)
    const signInButton = screen.getByText(/sign in/i)

    // When
    userEvent.type(emailInput, testUserData.email)
    userEvent.click(signInButton)

    // Then
    // TODO: TBD when validation and UI is implemented
  })
})
