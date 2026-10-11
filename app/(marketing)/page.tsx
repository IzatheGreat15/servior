const features = [
    {
        title: "Simpler Bookings",
        description:
            "Let customers see available courts, choose a time, and book in just a few clicks.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="m8 15 2 2 5-5" />
            </svg>
        ),
    },
    {
        title: "Automatic Notifications",
        description:
            "Keep customers informed with automatic booking confirmations and important updates.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
            </svg>
        ),
    },
    {
        title: "Payments Made Easy",
        description:
            "Accept online payments through the payment methods your customers already use.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18M7 15h3" />
            </svg>
        ),
    },
];

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <div className="relative isolate overflow-hidden">
                {/* Video background */}
                    <video
                        className="absolute inset-0 -z-20 h-full w-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        poster="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=2400&q=85"
                    >
                        <source src="https://www.pexels.com/download/video/17290112/" type="video/mp4" />
                    </video>

                    <div className="absolute inset-0 -z-10 bg-[#102d29]/80" />

                {/* Navigation */}
                <nav className="relative">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                        <a href="/" className="flex items-center gap-2.5">
                            <img src='/servior-logo.png' alt="Servior" className="w-9" />

                            <img src='/servior-name-white-logo.png' alt="Servior" className="w-30" />
                        </a>

                        <div className="hidden items-center gap-8 text-sm font-medium text-gray-300 md:flex">
                            <a href="#features" className="transition hover:text-green-600">
                                Features
                            </a>
                            <a href="#payments" className="transition hover:text-green-600">
                                Payments
                            </a>
                            <a href="#pricing" className="transition hover:text-green-600">
                                Pricing
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href="/login"
                                className="hidden text-sm font-semibold text-gray-300 transition hover:text-slate-900 sm:block"
                            >
                                Sign in
                            </a>

                            <a
                                href="/register"
                                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                            >
                                Get started
                            </a>
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.12),_transparent_35%)]" />

                    <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                Booking made simple
                            </div>

                            <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-gray-300 sm:text-6xl">
                                Make every booking{" "}
                                <span className="text-green-600">effortless.</span>
                            </h1>

                            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
                                Servior helps sports facilities manage court bookings,
                                payments, and customer notifications — all in one simple
                                platform.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="/register"
                                    className="rounded-xl bg-green-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
                                >
                                    Get Started
                                </a>

                                <a
                                    href="#features"
                                    className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    See how it works
                                </a>
                            </div>

                            <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                                <span className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    Easy setup
                                </span>

                                <span className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    Online bookings
                                </span>

                                <span className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    Secure payments
                                </span>
                            </div>
                        </div>

                        {/* Booking UI Preview */}
                        <div className="relative">
                            <div className="absolute" />

                            <div className="relative overflow-hidden rounded-[18px] border border-[#deece3] bg-white/[0.96] shadow-[0_15px_45px_rgba(22,64,43,0.10)]">
                                {/* Browser header */}
                                <div className="flex items-center gap-2 border-b border-[#edf2ee] px-4 py-3 sm:px-5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#d8e2dc]" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#d8e2dc]" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#d8e2dc]" />

                                    <div className="ml-3 min-w-0 flex-1 rounded-md bg-[#f8fbf9] px-3 py-1.5 text-xs text-[#809187]">
                                        cebu-pickle.servior.com
                                    </div>
                                </div>

                                <div className="grid gap-5 p-4 sm:p-5">
                                    {/* Booking heading */}
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f4ec] text-[#13834e]">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="h-5 w-5"
                                            >
                                                <rect x="3" y="4" width="18" height="17" rx="2" />
                                                <path d="M16 2v4M8 2v4M3 10h18" />
                                                <path d="m8 15 2 2 5-5" />
                                            </svg>
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#13834e]">
                                                Cebu Pickleball
                                            </p>
                                            <h3 className="mt-0.5 text-lg font-bold tracking-tight text-[#102d29]">
                                                Book a court
                                            </h3>
                                        </div>

                                        <span className="shrink-0 rounded-full border border-[#d6eadd] bg-[#f0f8f3] px-2.5 py-1 text-xs font-semibold text-[#13834e]">
                                            Online booking
                                        </span>
                                    </div>

                                    {/* Date selection */}
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-[#263f35]">
                                                Select a date
                                            </p>
                                            <span className="text-xs text-[#809187]">October 2026</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { day: "Mon", date: "12" },
                                                { day: "Tue", date: "13" },
                                                { day: "Wed", date: "14" },
                                            ].map((item, index) => (
                                                <div
                                                    key={item.date}
                                                    className={`rounded-xl border p-3 text-center transition ${index === 1
                                                        ? "border-[#13834e] bg-[#13834e] text-white shadow-sm"
                                                        : "border-[#e5eee8] bg-[#f8fbf9] text-[#52685b]"
                                                        }`}
                                                >
                                                    <p className="text-xs">{item.day}</p>
                                                    <p className="mt-1 text-lg font-bold">{item.date}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Available courts */}
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-[#263f35]">
                                                Available courts
                                            </p>
                                            <span className="text-xs text-[#809187]">3 courts</span>
                                        </div>

                                        <div className="space-y-2">
                                            {[
                                                { name: "Court 1", price: 500, selected: true },
                                                { name: "Court 2", price: 500, selected: false },
                                                { name: "Court 3", price: 600, selected: false },
                                            ].map((court) => (
                                                <div
                                                    key={court.name}
                                                    className={`flex items-center gap-3 rounded-xl border p-3 transition ${court.selected
                                                        ? "border-[#c8dfd0] bg-[#f0f8f3]"
                                                        : "border-[#e5eee8] bg-white"
                                                        }`}
                                                >
                                                    <span
                                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${court.selected
                                                            ? "bg-[#dcefe2] text-[#13834e]"
                                                            : "bg-[#f8fbf9] text-[#718579]"
                                                            }`}
                                                    >
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.7"
                                                            className="h-5 w-5"
                                                        >
                                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                                            <path d="M12 3v18M3 12h18" />
                                                        </svg>
                                                    </span>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-[#263f35]">
                                                            {court.name}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-[#718579]">
                                                            ₱{court.price.toLocaleString("en-PH")} / hour
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${court.selected
                                                            ? "bg-[#13834e] text-white"
                                                            : "border border-[#d8e2dc] bg-white text-[#52685b]"
                                                            }`}
                                                    >
                                                        {court.selected ? "Selected" : "Select"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Selected booking summary */}
                                    <div className="rounded-xl border border-[#e1ebe5] bg-[#f8fbf9] p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f4ec] text-[#13834e]">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        className="h-5 w-5"
                                                    >
                                                        <circle cx="12" cy="12" r="9" />
                                                        <path d="M12 7v5l3 2" />
                                                    </svg>
                                                </span>

                                                <div className="min-w-0">
                                                    <p className="text-xs text-[#718579]">Selected time slot</p>
                                                    <p className="mt-0.5 truncate text-sm font-semibold text-[#263f35]">
                                                        Court 1 · 7:00 PM – 8:00 PM
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-full border border-[#d6eadd] bg-[#f0f8f3] px-2 py-1 text-xs font-semibold text-[#13834e]">
                                                1 hour
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e1ebe5] pt-4">
                                            <span className="text-sm font-medium text-[#34483d]">
                                                Estimated total
                                            </span>
                                            <strong className="text-xl font-bold tracking-tight text-[#13834e]">
                                                ₱500
                                            </strong>
                                        </div>
                                    </div>

                                    {/* Continue action */}
                                    <div className="space-y-2">
                                        <div className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#13834e] px-4 text-sm font-semibold text-white shadow-sm">
                                            Continue
                                            <span aria-hidden="true" className="text-base">→</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Features */}
            <section id="features" className="border-y border-slate-100 bg-slate-50">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="max-w-2xl">
                        <p className="text-sm font-bold uppercase tracking-wider text-green-600">
                            Everything in one place
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Spend less time managing bookings.
                        </h2>

                        <p className="mt-4 text-lg text-slate-600">
                            Give your customers a better booking experience while keeping
                            your day-to-day operations simple.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                    {feature.icon}
                                </div>

                                <h3 className="mt-6 text-lg font-bold">{feature.title}</h3>

                                <p className="mt-3 leading-7 text-slate-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Email Notifications */}
            <section className="overflow-hidden">
                <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8">
                    <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-6 w-6"
                            >
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
                                <path d="m22 6-10 7L2 6" />
                            </svg>
                        </div>

                        <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                            Keep customers in the loop automatically.
                        </h2>

                        <p className="mt-5 text-lg leading-8 text-slate-600">
                            No more manually sending booking confirmations. Servior keeps
                            your customers informed from the moment they book.
                        </p>

                        <div className="mt-8 space-y-4">
                            {[
                                "Booking confirmation",
                                "Payment confirmation",
                                "Cancellation updates",
                                "Booking reminders",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                                        ✓
                                    </div>
                                    <span className="font-medium text-slate-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Email mockup */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xl">
                        <div className="rounded-xl border border-slate-200 bg-white p-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                                <div>
                                    <img src='/servior-name-logo.png' alt="Servior" className="w-20" />
                                    <p className="mt-1 text-xs text-slate-400">
                                        Booking confirmation
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white">
                                    <img src='/servior-logo.png' alt="Servior" className="w-9" />
                                </div>
                            </div>

                            <div className="py-6">
                                <p className="text-sm text-slate-500">Hi Kathleen,</p>

                                <h3 className="mt-2 text-xl font-bold">
                                    Your booking is confirmed!
                                </h3>

                                <div className="mt-6 rounded-xl bg-green-50 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                        Cebu Pickleball
                                    </p>

                                    <p className="mt-3 font-bold">Court 1</p>

                                    <p className="mt-1 text-sm text-slate-600">
                                        Tuesday, October 13 · 7:00 PM – 8:00 PM
                                    </p>

                                    <div className="mt-4 flex justify-between border-t border-green-100 pt-4 text-sm">
                                        <span className="text-slate-500">Total</span>
                                        <span className="font-bold">₱500.00</span>
                                    </div>
                                </div>

                                <button className="mt-6 w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white">
                                    View booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Payments */}
            <section id="payments" className="bg-gray-900 text-white">
                <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-green-400">
                            Payments
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Get paid without the back-and-forth.
                        </h2>

                        <p className="mt-5 text-lg leading-8 text-slate-400">
                            Give customers a convenient way to pay online and automatically
                            connect payments to their bookings.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            {["GCash", "Maya", "QR Ph", "Cards"].map((method) => (
                                <span
                                    key={method}
                                    className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-semibold"
                                >
                                    {method}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Today's revenue</p>
                                <p className="mt-1 text-3xl font-bold">₱12,450</p>
                            </div>

                            <div className="rounded-lg bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-400">
                                +18.4%
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            {[
                                ["Court 1 · 7:00 PM", "₱500", "Paid"],
                                ["Court 2 · 7:00 PM", "₱500", "Paid"],
                                ["Court 3 · 8:00 PM", "₱600", "Paid"],
                            ].map(([booking, amount, status]) => (
                                <div
                                    key={booking}
                                    className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 p-4"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{booking}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Payment received
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-semibold">{amount}</p>
                                        <p className="mt-1 text-xs text-green-400">{status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="bg-gray-50 py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-flex rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
                            Simple pricing
                        </span>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            A plan that grows with your business
                        </h2>

                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Start with one branch and upgrade as your sports business grows.
                        </p>
                    </div>

                    <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-3">
                        {/* Starter */}
                        <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Starter
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    Everything you need to start accepting online bookings.
                                </p>

                                <div className="mt-6 flex items-end gap-2">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                                        ₱999
                                    </span>
                                    <span className="mb-1 text-sm text-gray-500">
                                        / month
                                    </span>
                                </div>

                                <p className="mt-1 text-sm font-medium text-green-600">
                                    1 branch
                                </p>
                            </div>

                            <div className="my-8 h-px bg-gray-100" />

                            <ul className="space-y-4">
                                {[
                                    "1 branch",
                                    "Up to 5 courts",
                                    "Online booking page",
                                    "Court availability management",
                                    "Customer management",
                                    "Email booking notifications",
                                    "Online payment integration",
                                    "Booking management dashboard",
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                                            <svg
                                                className="h-3 w-3 text-green-600"
                                                viewBox="0 0 12 12"
                                                fill="none"
                                            >
                                                <path
                                                    d="M2.5 6.5L5 9L9.5 3.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="#contact"
                                className="mt-8 block rounded-xl border border-green-600 px-6 py-3 text-center text-sm font-semibold text-green-600 transition hover:bg-green-50"
                            >
                                Get started
                            </a>
                        </div>

                        {/* Growth */}
                        <div className="relative flex flex-col rounded-3xl border-2 border-green-500 bg-white p-8 shadow-xl shadow-green-100/50">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                                    MOST POPULAR
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Growth
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    Built for growing sports facilities with multiple locations.
                                </p>

                                <div className="mt-6 flex items-end gap-2">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                                        ₱1,999
                                    </span>
                                    <span className="mb-1 text-sm text-gray-500">
                                        / month
                                    </span>
                                </div>

                                <p className="mt-1 text-sm font-medium text-green-600">
                                    Up to 3 branches
                                </p>
                            </div>

                            <div className="my-8 h-px bg-gray-100" />

                            <ul className="space-y-4">
                                {[
                                    "Up to 3 branches",
                                    "Up to 15 courts",
                                    "Online booking pages",
                                    "Court availability management",
                                    "Customer management",
                                    "Email booking notifications",
                                    "Online payment integration",
                                    "Booking management dashboard",
                                    "Staff accounts",
                                    "Revenue & booking reports",
                                    "Branch-level management",
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                                            <svg
                                                className="h-3 w-3 text-green-600"
                                                viewBox="0 0 12 12"
                                                fill="none"
                                            >
                                                <path
                                                    d="M2.5 6.5L5 9L9.5 3.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="#contact"
                                className="mt-8 block rounded-xl bg-green-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                            >
                                Get started
                            </a>
                        </div>

                        {/* Business */}
                        <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Business
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    For established sports businesses operating multiple locations.
                                </p>

                                <div className="mt-6 flex items-end gap-2">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                                        ₱3,999
                                    </span>
                                    <span className="mb-1 text-sm text-gray-500">
                                        / month
                                    </span>
                                </div>

                                <p className="mt-1 text-sm font-medium text-green-600">
                                    Up to 10 branches
                                </p>
                            </div>

                            <div className="my-8 h-px bg-gray-100" />

                            <ul className="space-y-4">
                                {[
                                    "Up to 10 branches",
                                    "Unlimited courts",
                                    "Online booking pages",
                                    "Court availability management",
                                    "Customer management",
                                    "Email booking notifications",
                                    "Online payment integration",
                                    "Booking management dashboard",
                                    "Unlimited staff accounts",
                                    "Advanced revenue & booking reports",
                                    "Branch-level management",
                                    "Priority support",
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                                            <svg
                                                className="h-3 w-3 text-green-600"
                                                viewBox="0 0 12 12"
                                                fill="none"
                                            >
                                                <path
                                                    d="M2.5 6.5L5 9L9.5 3.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="#contact"
                                className="mt-8 block rounded-xl border border-green-600 px-6 py-3 text-center text-sm font-semibold text-green-600 transition hover:bg-green-50"
                            >
                                Contact us
                            </a>
                        </div>
                    </div>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Need more branches? Contact us for a custom plan.
                    </p>
                </div>
            </section>

            <div className="relative isolate overflow-hidden">
                {/* Shared background image for CTA and Footer */}
                <div
                    className="absolute inset-0 -z-20 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=2400&q=85')",
                    }}
                />

                {/* Shared dark green overlay */}
                <div className="absolute inset-0 -z-10 bg-[#102d29]/80" />

                {/* CTA */}
                <section id="pricing" className="relative">
                    <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ready to make bookings simpler?
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-green-50">
                            Give your customers a better way to book and give your team more
                            time to focus on running your facility.
                        </p>

                        <div className="mt-8">
                            <a
                                href="/register"
                                className="inline-flex rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-green-700 shadow-lg transition hover:bg-green-50"
                            >
                                Get started with Servior
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative text-white">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8">
                        <div className="rounded p-2">
                            <img src='/servior-name-white-logo.png' alt="Servior" className="w-30" />
                        </div>

                        <p className="text-green-50/80">
                            © 2026 Servior. All rights reserved.
                        </p>

                        <div className="flex gap-5">
                            <a href="#" className="text-green-50/80 transition hover:text-white">
                                Privacy
                            </a>
                            <a href="#" className="text-green-50/80 transition hover:text-white">
                                Terms
                            </a>
                        </div>
                    </div>
                </footer>
            </div>

        </main>
    );
}
