import Navigation from '@/components/layout/Navigation';
import BoardLeadershipCarousel from '@/components/about/BoardLeadershipCarousel';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Users, Target, Award, Shield, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Trans Nzoia County Public Service Board
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Committed to building a professional, efficient, and responsive public service
            that serves the people of Trans Nzoia County with excellence.
          </p>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To provide strategic human resource management services that promote 
                good governance, integrity, and service delivery in Trans Nzoia County.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To be a leading public service board that attracts, develops, and 
                retains competent human resources for effective service delivery.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Our Values</h3>
              <ul className="text-gray-600 text-left space-y-2">
                <li>• Integrity</li>
                <li>• Professionalism</li>
                <li>• Transparency</li>
                <li>• Accountability</li>
                <li>• Innovation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                The Trans Nzoia County Public Service Board was established under the 
                County Governments Act 2012 to provide human resource management 
                services to the County Government of Trans Nzoia.
              </p>
              <p>
                We are responsible for recruitment, selection, promotion, discipline, 
                and dismissal of county public officers in accordance with the 
                Constitution of Kenya 2010 and other relevant legislation.
              </p>
              <p>
                Our board consists of experienced professionals committed to ensuring 
                merit-based recruitment and maintaining high standards of public service 
                in Trans Nzoia County.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Do</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Users className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Recruitment & Selection</h4>
                  <p className="text-gray-600">
                    Conduct transparent and merit-based recruitment processes for 
                    county government positions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">HR Policy Development</h4>
                  <p className="text-gray-600">
                    Develop and implement human resource policies and procedures 
                    for the county government.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Building className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Capacity Building</h4>
                  <p className="text-gray-600">
                    Provide training and development opportunities to enhance 
                    employee performance and service delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Board Leadership Carousel */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Board Leadership
          </h2>
          <BoardLeadershipCarousel />
        </div>

        {/* Contact Information */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Get in Touch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Office Location</h4>
                <p className="text-gray-600">
                  Trans Nzoia County Headquarters<br />
                  P.O. Box 123-30200<br />
                  Kitale, Kenya
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                <p className="text-gray-600">
                  Phone: +254 700 000 000<br />
                  Email: info@tncpsb.go.ke<br />
                  Website: www.tncpsb.go.ke
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Office Hours</h4>
                <p className="text-gray-600">
                  Monday - Friday: 8:00 AM - 5:00 PM<br />
                  Saturday: 8:00 AM - 12:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
