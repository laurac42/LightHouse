type Props = {
    params: {
        id: string;
    }
}

export default function PropertyDetailsPage({params}: Props) {

    return (
        <div>
            <h1>Property Details</h1>
            <p>Property ID: {params.id}</p>
        </div>
    );
}