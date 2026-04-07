import Navbar from "@/components/navbar"

export default function FiltersPage() {
    return (
        <div className="bg-background w-full min-h-svh">
            <Navbar />
            <div className="w-full ">
                <svg className="hidden md:block" viewBox="0 0 1200 230" width={"100%"}>
                    <path d="M0,0 C20,50 50,60 150,70 L900,70 C1120,80 1160,90 1200,140"
                        fill="none" stroke="black" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
                        <text className="text-4xl fill-foreground" x="600" y="110" textAnchor="middle" dominantBaseline="middle">Help us guide you to the right home</text>
                    <path d="M0,90 C20,140 50,150 150,160 L900,160 C1120,170 1160,180 1200,230"
                        fill="none" stroke="black" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
                </svg>
                <h1 className="text-3xl mt-12 px-4 md:hidden flex justify-center text-center">Help us guide you to the right home</h1>
                <h3 className="text-lg md:text-xl px-4 mt-6 text-highlight flex justify-center text-center">Let us know what's important to you and we'll narrow things down</h3>
            </div>
        </div>
    )
}