type Props = {
  children: React.ReactNode
}

export function ModalFooter({ children }: Props) {
  return (
    <div
      style={{
        padding: "16px 24px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
      }}
    >
      {children}
    </div>
  )
}
