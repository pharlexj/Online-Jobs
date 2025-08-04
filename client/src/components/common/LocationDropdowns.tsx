import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationDropdownsProps {
  onLocationChange: (location: {
    countyId: number;
    constituencyId: number;
    wardId: number;
  }) => void;
  defaultValues?: {
    countyId?: number;
    constituencyId?: number;
    wardId?: number;
  };
}

export default function LocationDropdowns({ onLocationChange, defaultValues }: LocationDropdownsProps) {
  const [selectedCounty, setSelectedCounty] = useState<number | null>(defaultValues?.countyId || null);
  const [selectedConstituency, setSelectedConstituency] = useState<number | null>(defaultValues?.constituencyId || null);
  const [selectedWard, setSelectedWard] = useState<number | null>(defaultValues?.wardId || null);

  // Fetch counties
  const { data: counties = [] } = useQuery({
    queryKey: ['/api/public/counties'],
  });

  // Fetch constituencies based on selected county
  const { data: constituencies = [] } = useQuery({
    queryKey: ['/api/public/constituencies', selectedCounty],
    enabled: !!selectedCounty,
  });

  // Fetch wards based on selected constituency
  const { data: wards = [] } = useQuery({
    queryKey: ['/api/public/wards', selectedConstituency],
    enabled: !!selectedConstituency,
  });

  // Update parent component when location changes
  useEffect(() => {
    if (selectedCounty && selectedConstituency && selectedWard) {
      onLocationChange({
        countyId: selectedCounty,
        constituencyId: selectedConstituency,
        wardId: selectedWard,
      });
    }
  }, [selectedCounty, selectedConstituency, selectedWard, onLocationChange]);

  const handleCountyChange = (value: string) => {
    const countyId = parseInt(value);
    setSelectedCounty(countyId);
    setSelectedConstituency(null);
    setSelectedWard(null);
  };

  const handleConstituencyChange = (value: string) => {
    const constituencyId = parseInt(value);
    setSelectedConstituency(constituencyId);
    setSelectedWard(null);
  };

  const handleWardChange = (value: string) => {
    const wardId = parseInt(value);
    setSelectedWard(wardId);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Location Information</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* County Selection */}
        <div>
          <Label htmlFor="county">County *</Label>
          <Select value={selectedCounty?.toString() || ''} onValueChange={handleCountyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select county" />
            </SelectTrigger>
            <SelectContent>
              {counties.map((county) => (
                <SelectItem key={county.id} value={county.id.toString()}>
                  {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedCounty && (
            <p className="text-sm text-red-600 mt-1">County is required</p>
          )}
        </div>

        {/* Constituency Selection */}
        <div>
          <Label htmlFor="constituency">Constituency *</Label>
          <Select 
            value={selectedConstituency?.toString() || ''} 
            onValueChange={handleConstituencyChange}
            disabled={!selectedCounty}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedCounty ? "Select constituency" : "Select county first"} />
            </SelectTrigger>
            <SelectContent>
              {constituencies.map((constituency) => (
                <SelectItem key={constituency.id} value={constituency.id.toString()}>
                  {constituency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCounty && !selectedConstituency && (
            <p className="text-sm text-red-600 mt-1">Constituency is required</p>
          )}
        </div>

        {/* Ward Selection */}
        <div>
          <Label htmlFor="ward">Ward *</Label>
          <Select 
            value={selectedWard?.toString() || ''} 
            onValueChange={handleWardChange}
            disabled={!selectedConstituency}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedConstituency ? "Select ward" : "Select constituency first"} />
            </SelectTrigger>
            <SelectContent>
              {wards.map((ward) => (
                <SelectItem key={ward.id} value={ward.id.toString()}>
                  {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedConstituency && !selectedWard && (
            <p className="text-sm text-red-600 mt-1">Ward is required</p>
          )}
        </div>
      </div>

      {/* Location Summary */}
      {selectedCounty && selectedConstituency && selectedWard && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Selected Location:</strong>{' '}
            {wards.find(w => w.id === selectedWard)?.name} Ward,{' '}
            {constituencies.find(c => c.id === selectedConstituency)?.name} Constituency,{' '}
            {counties.find(c => c.id === selectedCounty)?.name} County
          </p>
        </div>
      )}
    </div>
  );
}
