import React from 'react'

export default function ErrorMessage({ message, clearError }) {
    if (message) {
        return (
            <>
                <div className="alert alert-danger alert-dismissible fade show" role="alert" style={{textAlign: "center"}}>
                    {message}
                    <button type="button" className="close" onClick={clearError}>&times;</button>
                </div>
            </>
        )
    }
    return <></>
}

