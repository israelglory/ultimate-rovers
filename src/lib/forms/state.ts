/** Shared shape returned by every form server action. */
export type FormStatus = 'idle' | 'success' | 'error'

export type FormState<Field extends string = string> = {
  status: FormStatus
  /** Form-level message, shown in a live region. */
  message?: string
  /** One message per invalid field, shown under that field. */
  fieldErrors?: Partial<Record<Field, string>>
  /** Echo of submitted values so the form keeps them after an error. */
  values?: Partial<Record<Field, string>>
}

export const idleState: FormState = { status: 'idle' }
