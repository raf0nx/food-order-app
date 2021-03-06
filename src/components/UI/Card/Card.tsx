import React from 'react'
import classNames from 'classnames'

interface CardProps {
  id?: string
  classes?: string
  tabIndex?: number
  ariaLabelledby?: string
  ariaDescribedBy?: string
  ariaModal?: boolean
  role?: string
  children?: JSX.Element | JSX.Element[]
  onClick?: () => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      id,
      children,
      classes,
      tabIndex,
      ariaLabelledby,
      ariaDescribedBy,
      ariaModal,
      role,
      onClick,
      onKeyDown,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
    },
    ref
  ) => {
    return (
      <article
        id={id}
        ref={ref}
        className={classNames(
          'bg-white rounded-lg border border-gray-200 shadow-md',
          classes
        )}
        tabIndex={tabIndex}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedBy}
        aria-modal={ariaModal}
        role={role}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {children}
      </article>
    )
  }
)
