import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter() {
        return {
            route: '/',
            pathname: '/',
            query: {},
            asPath: '/',
            push: jest.fn(),
            pop: jest.fn(),
            reload: jest.fn(),
            back: jest.fn(),
            prefetch: jest.fn(),
            beforePopState: jest.fn(),
            events: {
                on: jest.fn(),
                off: jest.fn(),
                emit: jest.fn(),
            },
        }
    },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
        }
    },
    useSearchParams() {
        return new URLSearchParams()
    },
    usePathname() {
        return '/'
    },
}))

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/tiffincrate-test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-google-maps-key'

// Mock Google Maps
global.google = {
    maps: {
        Map: jest.fn(),
        Marker: jest.fn(),
        InfoWindow: jest.fn(),
        DirectionsService: jest.fn(),
        DirectionsRenderer: jest.fn(),
        DistanceMatrixService: jest.fn(),
        places: {
            PlacesService: jest.fn(),
            AutocompleteService: jest.fn(),
        },
        geometry: {
            spherical: {
                computeDistanceBetween: jest.fn(),
            },
        },
    },
}

// Mock fetch globally
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

// Suppress console errors in tests unless explicitly testing them
const originalError = console.error
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is no longer supported')
        ) {
            return
        }
        originalError.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
})