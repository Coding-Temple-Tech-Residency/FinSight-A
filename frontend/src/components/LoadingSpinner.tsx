function LoadingSpinner() {
    return (
        <div className='flex items-center justify-center h-screen'>
            <div className='w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin'></div>
        </div>
    )
}

export default LoadingSpinner;