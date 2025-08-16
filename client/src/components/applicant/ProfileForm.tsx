import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import LocationDropdowns from '@/components/common/LocationDropdowns';
import { Plus, Trash2, Upload, FileText, Shield, Check } from 'lucide-react';

// Step schemas
const personalDetailsSchema = z.object({
  salutation: z.string().min(1, 'Salutation is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  surname: z.string().min(2, 'Surname must be at least 2 characters'),
  otherName: z.string().optional(),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  altPhoneNumber: z.string().optional(),
  nationalId: z.string().min(6, 'National ID is required'),
  idPassportType: z.enum(['national_id', 'passport', 'alien_id'], {
    required_error: 'Please select ID/Passport type',
  }),
  idPassportNumber: z.string().min(5, 'ID/Passport number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  nationality: z.string().default('Kenyan'),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  isPwd: z.boolean().default(false),
  pwdNumber: z.string().optional(),
  isEmployee: z.boolean().default(false),
  kraPin: z.string().optional(),
});

const addressSchema = z.object({
  countyId: z.number().min(1, 'County is required'),
  constituencyId: z.number().min(1, 'Constituency is required'),
  wardId: z.number().min(1, 'Ward is required'),
  address: z.string().optional(),
});

const educationSchema = z.object({
  educationRecords: z.array(z.object({
    institutionId: z.number(),
    courseId: z.number().optional(),
    awardId: z.number(),
    yearCompleted: z.number(),
    grade: z.string(),
  })),
});

interface ProfileFormProps {
  step: number;
  profile: any;
  onSave: (data: any) => void;
  isLoading: boolean;
}

export default function ProfileForm({ step, profile, onSave, isLoading }: ProfileFormProps) {
  const [educationRecords, setEducationRecords] = useState([
    { institutionId: 0, courseId: 0, awardId: 0, yearCompleted: new Date().getFullYear(), grade: '' }
  ]);
  const [employmentHistory, setEmploymentHistory] = useState([
    { employer: '', position: '', startDate: '', endDate: '', isCurrent: false, duties: '' }
  ]);
  const [referees, setReferees] = useState([
    { name: '', position: '', organization: '', email: '', phoneNumber: '', relationship: '' }
  ]);

  const { data: config } = useQuery({
    queryKey: ['/api/public/config'],
  });

  const institutions = config?.institutions || [];
  const awards = config?.awards || [];
  const courses = config?.courses || [];

  // Form setup based on current step
  const getFormSchema = () => {
    switch (step) {
      case 1:
        return personalDetailsSchema;
      case 2:
        return addressSchema;
      case 3:
        return educationSchema;
      default:
        return z.object({});
    }
  };

  const form = useForm({
    resolver: zodResolver(getFormSchema()),
    defaultValues: profile || {},
  });

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      form.reset(profile);
      if (profile.educationRecords?.length) {
        setEducationRecords(profile.educationRecords);
      }
      if (profile.employmentHistory?.length) {
        setEmploymentHistory(profile.employmentHistory);
      }
      if (profile.referees?.length) {
        setReferees(profile.referees);
      }
    }
  }, [profile, form]);

  const handleSubmit = (data: any) => {
    const stepData = {
      ...data,
      educationRecords: step === 3 ? educationRecords : undefined,
      employmentHistory: step === 6 ? employmentHistory : undefined,
      referees: step === 7 ? referees : undefined,
    };
    
    onSave(stepData);
  };

  const addEducationRecord = () => {
    setEducationRecords([
      ...educationRecords,
      { institutionId: 0, courseId: 0, awardId: 0, yearCompleted: new Date().getFullYear(), grade: '' }
    ]);
  };

  const removeEducationRecord = (index: number) => {
    if (educationRecords.length > 1) {
      setEducationRecords(educationRecords.filter((_, i) => i !== index));
    }
  };

  const updateEducationRecord = (index: number, field: string, value: any) => {
    const updated = [...educationRecords];
    updated[index] = { ...updated[index], [field]: value };
    setEducationRecords(updated);
  };

  const addEmploymentRecord = () => {
    setEmploymentHistory([
      ...employmentHistory,
      { employer: '', position: '', startDate: '', endDate: '', isCurrent: false, duties: '' }
    ]);
  };

  const removeEmploymentRecord = (index: number) => {
    if (employmentHistory.length > 1) {
      setEmploymentHistory(employmentHistory.filter((_, i) => i !== index));
    }
  };

  const updateEmploymentRecord = (index: number, field: string, value: any) => {
    const updated = [...employmentHistory];
    updated[index] = { ...updated[index], [field]: value };
    setEmploymentHistory(updated);
  };

  const addReferee = () => {
    setReferees([
      ...referees,
      { name: '', position: '', organization: '', email: '', phoneNumber: '', relationship: '' }
    ]);
  };

  const removeReferee = (index: number) => {
    if (referees.length > 1) {
      setReferees(referees.filter((_, i) => i !== index));
    }
  };

  const updateReferee = (index: number, field: string, value: any) => {
    const updated = [...referees];
    updated[index] = { ...updated[index], [field]: value };
    setReferees(updated);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: // Personal Details
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salutation">Salutation *</Label>
                <Select onValueChange={(value) => form.setValue('salutation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salutation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Prof">Prof</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  placeholder="Enter first name"
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.firstName.message as string}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="surname">Surname *</Label>
                <Input
                  id="surname"
                  {...form.register('surname')}
                  placeholder="Enter surname"
                />
                {form.formState.errors.surname && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.surname.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="otherName">Other Name</Label>
                <Input
                  id="otherName"
                  data-testid="input-otherName"
                  {...form.register('otherName')}
                  placeholder="Enter other name (optional)"
                />
              </div>
              
              <div>
                <Label htmlFor="nationalId">National ID *</Label>
                <Input
                  id="nationalId"
                  data-testid="input-nationalId"
                  {...form.register('nationalId')}
                  placeholder="Enter national ID number"
                />
                {form.formState.errors.nationalId && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.nationalId.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idPassportType">ID/Passport Type *</Label>
                <Select onValueChange={(value) => form.setValue('idPassportType', value as any)}>
                  <SelectTrigger data-testid="select-idPassportType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national_id">National ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="alien_id">Alien ID</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.idPassportType && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.idPassportType.message as string}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="idPassportNumber">ID/Passport Number *</Label>
                <Input
                  id="idPassportNumber"
                  data-testid="input-idPassportNumber"
                  {...form.register('idPassportNumber')}
                  placeholder="Enter ID/Passport number"
                />
                {form.formState.errors.idPassportNumber && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.idPassportNumber.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...form.register('dateOfBirth')}
                />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.dateOfBirth.message as string}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={(value) => form.setValue('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  {...form.register('nationality')}
                  defaultValue="Kenyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  {...form.register('phoneNumber')}
                  placeholder="e.g., 0711234567"
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.phoneNumber.message as string}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="altPhoneNumber">Alternative Phone Number</Label>
                <Input
                  id="altPhoneNumber"
                  {...form.register('altPhoneNumber')}
                  placeholder="e.g., 0711234567 (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <Input
                  id="ethnicity"
                  {...form.register('ethnicity')}
                  placeholder="e.g., Luhya"
                />
              </div>
              
              <div>
                <Label htmlFor="religion">Religion</Label>
                <Input
                  id="religion"
                  {...form.register('religion')}
                  placeholder="e.g., Christianity"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPwd"
                  {...form.register('isPwd')}
                />
                <Label htmlFor="isPwd">I am a Person with Disability (PWD)</Label>
              </div>
              
              {form.watch('isPwd') && (
                <div>
                  <Label htmlFor="pwdNumber">PWD Certificate Number</Label>
                  <Input
                    id="pwdNumber"
                    {...form.register('pwdNumber')}
                    placeholder="Enter PWD certificate number"
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEmployee"
                  {...form.register('isEmployee')}
                />
                <Label htmlFor="isEmployee">I am currently a county employee</Label>
              </div>
              
              <div>
                <Label htmlFor="kraPin">KRA PIN</Label>
                <Input
                  id="kraPin"
                  {...form.register('kraPin')}
                  placeholder="Enter KRA PIN (optional)"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Address Information
        return (
          <div className="space-y-6">
            <LocationDropdowns
              onLocationChange={(location) => {
                form.setValue('countyId', location.countyId);
                form.setValue('constituencyId', location.constituencyId);
                form.setValue('wardId', location.wardId);
              }}
              defaultValues={{
                countyId: profile?.countyId,
                constituencyId: profile?.constituencyId,
                wardId: profile?.wardId,
              }}
            />
            
            <div>
              <Label htmlFor="address">Physical Address</Label>
              <Textarea
                id="address"
                {...form.register('address')}
                placeholder="Enter your physical address (optional)"
                rows={3}
              />
            </div>
          </div>
        );

      case 3: // Educational Background
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Educational Qualifications</h4>
              <Button type="button" variant="outline" onClick={addEducationRecord}>
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </div>

            {educationRecords.map((record, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Education Record {index + 1}</h5>
                    {educationRecords.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducationRecord(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Institution</Label>
                      <Select onValueChange={(value) => updateEducationRecord(index, 'institutionId', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select institution" />
                        </SelectTrigger>
                        <SelectContent>
                          {institutions.map((institution) => (
                            <SelectItem key={institution.id} value={institution.id.toString()}>
                              {institution.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Award Level</Label>
                      <Select onValueChange={(value) => updateEducationRecord(index, 'awardId', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select award level" />
                        </SelectTrigger>
                        <SelectContent>
                          {awards.map((award) => (
                            <SelectItem key={award.id} value={award.id.toString()}>
                              {award.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Year Completed</Label>
                      <Input
                        type="number"
                        min="1950"
                        max={new Date().getFullYear()}
                        value={record.yearCompleted}
                        onChange={(e) => updateEducationRecord(index, 'yearCompleted', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label>Grade/Score</Label>
                      <Input
                        value={record.grade}
                        onChange={(e) => updateEducationRecord(index, 'grade', e.target.value)}
                        placeholder="e.g., First Class, A, 3.8 GPA"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 6: // Employment History
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Employment History</h4>
              <Button type="button" variant="outline" onClick={addEmploymentRecord}>
                <Plus className="w-4 h-4 mr-2" />
                Add Employment
              </Button>
            </div>

            {employmentHistory.map((record, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Employment Record {index + 1}</h5>
                    {employmentHistory.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmploymentRecord(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Employer</Label>
                      <Input
                        value={record.employer}
                        onChange={(e) => updateEmploymentRecord(index, 'employer', e.target.value)}
                        placeholder="Company/Organization name"
                      />
                    </div>

                    <div>
                      <Label>Position</Label>
                      <Input
                        value={record.position}
                        onChange={(e) => updateEmploymentRecord(index, 'position', e.target.value)}
                        placeholder="Job title"
                      />
                    </div>

                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={record.startDate}
                        onChange={(e) => updateEmploymentRecord(index, 'startDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={record.endDate}
                        onChange={(e) => updateEmploymentRecord(index, 'endDate', e.target.value)}
                        disabled={record.isCurrent}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        checked={record.isCurrent}
                        onCheckedChange={(checked) => updateEmploymentRecord(index, 'isCurrent', checked)}
                      />
                      <Label>This is my current position</Label>
                    </div>

                    <div>
                      <Label>Key Duties and Responsibilities</Label>
                      <Textarea
                        value={record.duties}
                        onChange={(e) => updateEmploymentRecord(index, 'duties', e.target.value)}
                        placeholder="Describe your key duties and responsibilities..."
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 7: // Referees
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Professional Referees</h4>
              <Button type="button" variant="outline" onClick={addReferee}>
                <Plus className="w-4 h-4 mr-2" />
                Add Referee
              </Button>
            </div>

            {referees.map((referee, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Referee {index + 1}</h5>
                    {referees.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReferee(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={referee.name}
                        onChange={(e) => updateReferee(index, 'name', e.target.value)}
                        placeholder="Referee's full name"
                      />
                    </div>

                    <div>
                      <Label>Position/Title</Label>
                      <Input
                        value={referee.position}
                        onChange={(e) => updateReferee(index, 'position', e.target.value)}
                        placeholder="Professional title"
                      />
                    </div>

                    <div>
                      <Label>Organization</Label>
                      <Input
                        value={referee.organization}
                        onChange={(e) => updateReferee(index, 'organization', e.target.value)}
                        placeholder="Company/Organization"
                      />
                    </div>

                    <div>
                      <Label>Relationship</Label>
                      <Input
                        value={referee.relationship}
                        onChange={(e) => updateReferee(index, 'relationship', e.target.value)}
                        placeholder="e.g., Former Supervisor"
                      />
                    </div>

                    <div>
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={referee.email}
                        onChange={(e) => updateReferee(index, 'email', e.target.value)}
                        placeholder="referee@email.com"
                      />
                    </div>

                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={referee.phoneNumber}
                        onChange={(e) => updateReferee(index, 'phoneNumber', e.target.value)}
                        placeholder="0711234567"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 8: // Document Uploads
        return (
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Document Uploads</h4>
            <p className="text-gray-600 text-sm">
              Upload the required documents. All files should be in PDF format and not exceed 5MB each.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'national_id', label: 'National ID Copy', required: true },
                { key: 'certificates', label: 'Academic Certificates', required: true },
                { key: 'transcripts', label: 'Academic Transcripts', required: true },
                { key: 'professional_certs', label: 'Professional Certificates', required: false },
                { key: 'kra_pin', label: 'KRA PIN Certificate', required: false },
                { key: 'good_conduct', label: 'Good Conduct Certificate', required: true },
              ].map((doc) => (
                <Card key={doc.key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">{doc.label}</h5>
                      {doc.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF files only, max 5MB</p>
                      <input
                        type="file"
                        accept=".pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>No file uploaded</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Step content not available</p>
          </div>
        );
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {renderStepContent()}
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </form>
  );
}
