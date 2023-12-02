function Error({ statusCode }: {statusCode: any}) {
  return (
    <p>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client'}
    </p>
  )
}

Error.getInitialProps = ({ res, err }: {res: any, err: any}) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404

    if(err) {
        console.log(err);
    }
    return { statusCode }
}

export default Error
