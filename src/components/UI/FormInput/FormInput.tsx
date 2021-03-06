import { ErrorMessage } from '@hookform/error-message'
import {
  RegisterOptions,
  UseFormRegister,
  Path,
  DeepMap,
  FieldError,
  get,
} from 'react-hook-form'
import classNames from 'classnames'
import { CSSTransition } from 'react-transition-group'

import Input, { InputProps } from '../Input'

type FormInputProps<TFormValues> = {
  name: Path<TFormValues>
  rules?: RegisterOptions
  register?: UseFormRegister<TFormValues>
  errors?: Partial<DeepMap<TFormValues, FieldError>>
  classes?: string
} & Omit<InputProps, 'name'>

export const FormInput = <TFormValues extends Record<string, unknown>>({
  name,
  register,
  rules,
  errors,
  classes = '',
  ...props
}: FormInputProps<TFormValues>): JSX.Element => {
  const errorMessages = get(errors, name)
  const hasError = !!(errors && errorMessages)

  return (
    <div className={classes}>
      <Input
        name={name}
        hasError={hasError}
        labelClasses={classNames({ 'text-red-700': hasError })}
        {...props}
        {...(register && register(name, rules))}
      />
      <CSSTransition
        in={hasError}
        timeout={1200}
        classNames={{ enterActive: 'animate-shake' }}
      >
        <p className="my-1 text-xs text-red-600 min-h-4">
          <ErrorMessage
            errors={errors}
            name={name as any}
            render={({ message }) => <span>{message}</span>}
          />
        </p>
      </CSSTransition>
    </div>
  )
}
