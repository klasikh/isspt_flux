function Error({ statusCode }: {statusCode: any}) {
  return (

    <div className="min-h-screen">
    <div className="flex flex-col h-screen justify-between p-4">
      <p className="text-center text-3xl">
        {
          statusCode
          ? `Une erreur ${statusCode} s'est produite sur le serveur...`
          : `Une erreur s'est produite ...`
        }
      </p>
    </div>
    </div>
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
