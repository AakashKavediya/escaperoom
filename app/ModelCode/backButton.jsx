import Link from "next/link"
const BackButton = () => {
    return(
        <div   className="absolute top-6 right-6 py-2 px-4 font-bold rounded-xl bg-orange-500" >
            <Link href="/">Back</Link>
        </div>
    )
}

export default BackButton