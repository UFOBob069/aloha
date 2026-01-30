import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getCurrentUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-teal-600">Aloha</span>
              <span className="text-2xl font-light text-gray-600">Rising</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Find Purpose Through{' '}
            <span className="text-teal-600">Connection</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            Aloha Rising is a trusted community where you can share your wisdom,
            find meaningful connections, and contribute to something bigger than yourself.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
            >
              Join the Community
            </Link>
            <a
              href="#why"
              className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Why Aloha Rising */}
      <section id="why" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Why Aloha Rising?
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            We believe human experience is the largest unused asset on the planet.
            Everyone has wisdom worth sharing.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-2xl border border-teal-100">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">A Place to Belong</h3>
              <p className="text-gray-600 leading-relaxed">
                Join small, purpose-driven groups where you are seen as a person,
                not a profile. Real names, real intentions, real connection.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-2xl border border-amber-100">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">A Place to Give</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your experience and wisdom with those who need it.
                Help others navigate the challenges you have already overcome.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">A Place to Be Needed</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with people who are seeking guidance from someone who has been there.
                Your experience matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
            Who Is This For?
          </h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Those With Wisdom to Share
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  You have decades of experience, lessons learned, and insights gained.
                  You want to contribute and stay engaged. You are looking for a place
                  where your experience is valued.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Those Seeking Guidance
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  You are navigating new challenges, career transitions, or life decisions.
                  You want real-world perspective from someone who has been there,
                  not algorithms or generic advice.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Those Seeking Connection
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  You want meaningful relationships, not surface-level interactions.
                  You are looking for a community that values depth over volume,
                  quality over quantity.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Connectors & Caregivers
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  You have a parent, friend, or loved one who needs this.
                  You want to help them find community and purpose.
                  You are thinking: &ldquo;My mom/dad needs this.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Getting started is simple. No complicated profiles. No endless forms.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Join</h3>
              <p className="text-gray-600">
                Sign up with your name and email. Tell us what brings you here.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore</h3>
              <p className="text-gray-600">
                Browse groups and members. Find people and topics that resonate.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect</h3>
              <p className="text-gray-600">
                Join a group or request a conversation with another member.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contribute</h3>
              <p className="text-gray-600">
                Share your wisdom, support others, and find your purpose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <blockquote className="text-2xl sm:text-3xl font-light leading-relaxed mb-8">
            &ldquo;My father spent 40 years building businesses and mentoring young entrepreneurs.
            After retirement, he lost his sense of purpose. He had so much to give,
            but nowhere to give it. That is why we built Aloha Rising.&rdquo;
          </blockquote>
          <p className="text-teal-100 text-lg">
            A founding story from our community
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join a community where you can feel useful again.
            Where your experience matters. Where you belong.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-teal-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
          >
            Join the Community
          </Link>
          <p className="mt-6 text-gray-500">
            Already a member?{' '}
            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-xl font-bold text-white">Aloha</span>
              <span className="text-xl font-light text-gray-400">Rising</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/code-of-conduct" className="hover:text-white transition-colors">
                Code of Conduct
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>Built with care for a community that matters.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
