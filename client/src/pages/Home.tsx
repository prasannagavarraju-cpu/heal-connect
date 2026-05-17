import { Link } from 'react-router-dom';
import {
  Heart, MapPin, Clock, Shield, Phone, Star,
  Users, Stethoscope, Ambulance, ArrowRight, CheckCircle
} from 'lucide-react';

const features = [
  {
    icon: Phone,
    title: 'One-Tap Emergency',
    desc: 'Instantly alert nearby doctors and emergency staff with a single button — no forms, no delay.',
    color: 'text-emergency-600',
    bg: 'bg-emergency-50',
  },
  {
    icon: MapPin,
    title: 'Live Location Sharing',
    desc: 'Real-time GPS sharing lets doctors navigate directly to you. No need to explain your address.',
    color: 'text-primary-700',
    bg: 'bg-primary-50',
  },
  {
    icon: Clock,
    title: 'Instant Response',
    desc: 'Nearby medical staff receive your request in real time and can accept within seconds.',
    color: 'text-medical-600',
    bg: 'bg-medical-50',
  },
  {
    icon: Shield,
    title: 'Verified Professionals',
    desc: 'Every doctor, nurse, and paramedic is license-verified before joining the platform.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

const howItWorks = [
  { step: '01', title: 'Register & Set Up', desc: 'Create your health profile with medical history, allergies, and emergency contacts.' },
  { step: '02', title: 'Describe Your Need', desc: 'Share your symptoms and urgency level — from routine checkup to emergency SOS.' },
  { step: '03', title: 'Doctor Arrives', desc: 'A nearby verified professional accepts your request and arrives at your home.' },
];

const stats = [
  { value: '50K+', label: 'Patients Helped' },
  { value: '8K+', label: 'Verified Doctors' },
  { value: '< 15 min', label: 'Avg. Response Time' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Serving patients across India
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Healthcare That<br />
              <span className="text-blue-300">Comes to You</span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed mb-10 max-w-2xl">
              Connecting elderly patients, disabled individuals, and people living alone with verified
              doctors, nurses, and emergency staff — right at their doorstep.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/register?role=PATIENT"
                className="inline-flex items-center gap-2.5 bg-white text-primary-800 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                <Heart className="w-5 h-5" fill="currentColor" />
                I Need Medical Help
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register?role=DOCTOR"
                className="inline-flex items-center gap-2.5 border-2 border-white/60 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-all"
              >
                <Stethoscope className="w-5 h-5" />
                Join as a Doctor
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-5">
              {[
                { icon: Stethoscope, text: 'Doctors & Nurses' },
                { icon: Ambulance, text: 'Emergency Staff' },
                { icon: Clock, text: '24/7 Available' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-blue-200 text-sm">
                  <Icon className="w-4 h-4" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-800 py-10 border-t border-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center text-white">
                <div className="text-3xl sm:text-4xl font-bold text-blue-300">{value}</div>
                <div className="text-blue-200 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Why HealConnect?</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Built specifically for patients who cannot easily visit hospitals.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">How It Works</h2>
            <p className="text-slate-500 text-lg">Simple enough for anyone — including elderly users.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-primary-100 z-0" />
            {howItWorks.map(({ step, title, desc }) => (
              <div key={step} className="relative text-center z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary-700 text-white text-xl font-bold flex items-center justify-center mx-auto mb-5 shadow-lg">
                  {step}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Who We Serve</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: '👴',
                title: 'Elderly Patients',
                desc: 'Seniors living alone or with limited mobility who need regular or emergency medical attention at home.',
                points: ['Large text interface', 'Voice assistance', 'One-tap emergency SOS'],
              },
              {
                icon: '♿',
                title: 'Disabled Individuals',
                desc: 'People with physical disabilities who face barriers visiting hospitals or clinics.',
                points: ['Home visit first priority', 'Specialized medical staff', 'Accessible UI design'],
              },
              {
                icon: '🏠',
                title: 'Living Alone',
                desc: 'People whose family is away for work who need immediate medical help during emergencies.',
                points: ['Emergency contact alerts', 'Real-time status updates', '24/7 availability'],
              },
            ].map(({ icon, title, desc, points }) => (
              <div key={title} className="card hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{desc}</p>
                <ul className="space-y-1.5">
                  {points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-medical-700">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-emergency-600 to-emergency-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
            <Phone className="w-8 h-8" fill="white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Medical Emergency?</h2>
          <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">
            Don't wait. Register and request emergency assistance — a nearby doctor will be alerted immediately.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-emergency-700 font-bold px-10 py-5 rounded-2xl text-xl hover:bg-red-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            <Phone className="w-6 h-6" fill="currentColor" />
            Get Help Now
          </Link>
        </div>
      </section>

      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <div>
                <div className="font-bold text-lg">HealConnect</div>
                <div className="text-blue-300 text-sm">Healthcare at your doorstep</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-blue-300">
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
              <a href="tel:112" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> Emergency: 112
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-blue-400" />
              <Star className="w-5 h-5 text-blue-400" />
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-primary-800 text-center text-sm text-blue-400">
            © 2024 HealConnect. Bridging the gap between patients and healthcare professionals.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
