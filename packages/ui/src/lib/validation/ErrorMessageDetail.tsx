export function ErrorMessageDetail(
  displayError: any,
  defaultMessage: string | undefined | null = '',
  shouldShowDetail: boolean = false,
) {
  const optDetailStr =
    shouldShowDetail && displayError?.message
      ? ' (' + displayError?.message + ')'
      : '';

  return (
    <>
      {displayError?.defaultMessage ? (
        <>
          <div>{displayError?.defaultMessage}</div>
          {optDetailStr && <div>{optDetailStr}</div>}
        </>
      ) : (
        <>
          <div>{defaultMessage}</div>
          {optDetailStr && <div>{optDetailStr}</div>}
        </>
      )}
    </>
  );
}
export default ErrorMessageDetail;
