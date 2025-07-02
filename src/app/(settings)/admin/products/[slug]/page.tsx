export default function ProductPage({params}: {params: {slug: string}}) {
    return <div>Product Page: {params.slug}</div>
}