import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import AuthForm from '.'

import { customRender } from '../../utils/test/CustomRender'

const BASE_AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts/'

const testUserData = {
  email: 'test@email.com',
  displayName: 'Name',
  password: 'Password1',
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

const mockedUseHistory = jest.fn()

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useHistory: () => ({
    replace: mockedUseHistory,
  }),
}))

describe('<AuthForm />', () => {
  beforeAll(() => server.listen())

  afterEach(() => server.resetHandlers())

  afterAll(() => server.close())

  test('should change auth mode', async () => {
    // Given
    customRender(<AuthForm />)
    expect(screen.getByText(/really hungry?/i)).toBeInTheDocument()

    // When
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('[space]')

    // Then
    expect(screen.queryByText(/really hungry?/i)).not.toBeInTheDocument()
    expect(screen.getByText(/create a new account/i)).toBeInTheDocument()
  })

  test('should update email, name and password', async () => {
    // Given
    customRender(<AuthForm />)
    const changeAuthModeBtn = screen.getByText(/sign up!/i)

    // When
    await userEvent.click(changeAuthModeBtn)

    const emailInput = screen.getByLabelText(
      /e-mail address/i
    ) as HTMLInputElement
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    await userEvent.type(emailInput, testUserData.email)
    await userEvent.type(nameInput, testUserData.displayName)
    await userEvent.type(passwordInput, testUserData.password)

    // Then
    expect(emailInput.value).toBe(testUserData.email)
    expect(nameInput.value).toBe(testUserData.displayName)
    expect(passwordInput.value).toBe(testUserData.password)
  })

  test('should sign in user in login mode', async () => {
    // Given
    customRender(<AuthForm />)

    const emailInput = screen.getByLabelText(/e-mail address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByText(/sign in/i)

    // When
    await userEvent.type(emailInput, testUserData.email)
    await userEvent.type(passwordInput, testUserData.password)
    await userEvent.click(signInButton)

    // Then
    await screen.findByText(/please wait.../i)
    await waitFor(() => expect(mockedUseHistory).toHaveBeenCalled())
  })

  test('should sign up a user in register mode', async () => {
    // Given
    customRender(<AuthForm />)
    const changeAuthModeBtn = screen.getByText(/sign up!/i)

    // When
    await userEvent.click(changeAuthModeBtn)

    const emailInput = screen.getByLabelText(/e-mail address/i)
    const nameInput = screen.getByLabelText(/name/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signUpButton = screen.getByText(/create account/i)

    await userEvent.type(emailInput, testUserData.email)
    await userEvent.type(nameInput, testUserData.displayName)
    await userEvent.type(passwordInput, testUserData.password)
    await userEvent.click(signUpButton)

    // Then
    expect(await screen.findByText(/please wait.../i)).toBeInTheDocument()
    await waitFor(() => expect(mockedUseHistory).toHaveBeenCalled())
  })

  test('should catch a server side error, display error message in the alert and dismiss the alert', async () => {
    // Given
    customRender(<AuthForm />)

    server.use(
      rest.post(
        'https://identitytoolkit.googleapis.com/v1/accounts/:signInWithPassword',
        (_, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              error: {
                message: 'Invalid password',
                code: 400,
              },
            })
          )
        }
      )
    )

    const emailInput = screen.getByLabelText(/e-mail address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByText(/sign in/i)

    // When
    await userEvent.type(emailInput, testUserData.email)
    await userEvent.type(passwordInput, testUserData.password)
    await userEvent.click(signInButton)

    // Then
    expect(await screen.findByText(/invalid password/i)).toBeInTheDocument()

    const closeAlertBtn = screen.getByRole('button', { name: 'Close' })
    await userEvent.click(closeAlertBtn)

    await waitFor(() =>
      expect(screen.queryByText(/invalid password/i)).not.toBeInTheDocument()
    )
  })
})
