import Link from 'next/link';

export const metadata = {
  title: 'Code of Conduct - Aloha Rising',
  description: 'Our community guidelines for creating a safe, respectful, and supportive environment.',
};

export default function CodeOfConductPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-teal-600">Aloha</span>
            <span className="text-2xl font-light text-gray-600">Rising</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Code of Conduct</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Aloha Rising is built on trust, respect, and genuine human connection. This Code of Conduct outlines our
            expectations for all community members to ensure a safe and welcoming environment for everyone.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">Our Principles</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Treat Everyone with Respect</h3>
          <p className="text-gray-700 mb-4">
            Every member of our community deserves to be treated with dignity and respect, regardless of their
            background, experience, or perspective. We celebrate diversity and believe that different viewpoints enrich
            our community.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Be Genuine and Honest</h3>
          <p className="text-gray-700 mb-4">
            Use your real name and be authentic in your interactions. Honesty builds trust, and trust is the foundation
            of meaningful connection. Do not misrepresent yourself or your intentions.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. Listen More Than You Speak</h3>
          <p className="text-gray-700 mb-4">
            One of the greatest gifts you can give is your attention. Listen to understand, not just to respond. Create
            space for others to share their experiences and perspectives.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Protect Privacy</h3>
          <p className="text-gray-700 mb-4">
            What is shared in the community stays in the community. Do not share personal stories, struggles, or private
            information that others have shared with you without their explicit permission.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. No Commercial Solicitation</h3>
          <p className="text-gray-700 mb-4">
            This is a community for connection, not commerce. Do not use the platform to sell products, services, or
            promote businesses unless explicitly invited to do so in a designated space.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">Unacceptable Behavior</h2>
          <p className="text-gray-700 mb-4">The following behaviors are not tolerated in our community:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Harassment, intimidation, or bullying of any kind</li>
            <li>Discriminatory language or behavior based on race, gender, age, religion, disability, or any other characteristic</li>
            <li>Sharing sexually explicit or violent content</li>
            <li>Spam, scams, or deceptive practices</li>
            <li>Impersonating others or creating fake accounts</li>
            <li>Sharing others&apos; private information without consent</li>
            <li>Any illegal activity</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">Reporting Concerns</h2>
          <p className="text-gray-700 mb-4">
            If you experience or witness behavior that violates this Code of Conduct, please report it immediately. You
            can report concerns through:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>The Report button on any member&apos;s profile or group page</li>
            <li>Contacting a community facilitator or administrator</li>
          </ul>
          <p className="text-gray-700 mb-4">
            All reports are taken seriously and will be reviewed promptly. We are committed to protecting the privacy of
            those who report concerns.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">Consequences</h2>
          <p className="text-gray-700 mb-4">
            Violations of this Code of Conduct may result in:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>A private warning from community moderators</li>
            <li>Temporary suspension from the community</li>
            <li>Permanent removal from the community</li>
          </ul>
          <p className="text-gray-700 mb-4">
            The specific consequences will depend on the nature and severity of the violation, as determined by the
            community administrators.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">Our Commitment</h2>
          <p className="text-gray-700 mb-4">
            We are committed to maintaining a community that is safe, welcoming, and supportive for everyone. We
            regularly review and update this Code of Conduct to reflect the evolving needs of our community.
          </p>
          <p className="text-gray-700 mb-4">
            Thank you for being part of Aloha Rising and helping us create a space where everyone can find purpose
            through connection.
          </p>

          <div className="mt-12 p-6 bg-teal-50 rounded-xl border border-teal-100">
            <p className="text-teal-800 text-center">
              By joining Aloha Rising, you agree to abide by this Code of Conduct.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-gray-500">
          <p>
            <Link href="/" className="text-teal-600 hover:text-teal-700">
              Back to Home
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
