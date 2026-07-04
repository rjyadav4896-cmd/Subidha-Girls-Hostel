import { useMemo, useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { apiFetch } from '../lib/api';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

type UploadField = {
  dataUrl: string;
  fileName: string;
};

export function ReadyToLiveModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [bedType, setBedType] = useState<'2-Seater' | '3-Seater' | '4-Seater' | '5-Seater'>('3-Seater');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [address, setAddress] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [localGuardianName, setLocalGuardianName] = useState('');
  const [collegeOrWorkTiming, setCollegeOrWorkTiming] = useState('');
  const [dateOfEntry, setDateOfEntry] = useState('');
  const [passportPhoto, setPassportPhoto] = useState<UploadField | null>(null);
  const [citizenship, setCitizenship] = useState<UploadField | null>(null);

  const canSubmit = useMemo(() => {
    return (
      fullName &&
      roomNumber &&
      bedType &&
      phone &&
      email &&
      school &&
      address &&
      guardianName &&
      localGuardianName &&
      collegeOrWorkTiming &&
      dateOfEntry &&
      passportPhoto &&
      citizenship
    );
  }, [
    fullName,
    roomNumber,
    bedType,
    phone,
    email,
    school,
    address,
    guardianName,
    localGuardianName,
    collegeOrWorkTiming,
    dateOfEntry,
    passportPhoto,
    citizenship
  ]);

  function readUpload(file: File): Promise<UploadField> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please upload an image file.'));
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        reject(new Error('Each image must be 5 MB or smaller.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: String(reader.result), fileName: file.name });
      reader.onerror = () => reject(new Error('Could not read the selected file.'));
      reader.readAsDataURL(file);
    });
  }

  async function handleUpload(file: File | undefined, setValue: (value: UploadField | null) => void) {
    setError(null);
    if (!file) {
      setValue(null);
      return;
    }

    try {
      setValue(await readUpload(file));
    } catch (e: any) {
      setValue(null);
      setError(e?.message ?? 'Invalid file upload');
    }
  }

  async function submit() {
    setError(null);
    if (!passportPhoto || !citizenship) {
      setError('Please attach passport size photo and citizenship image.');
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch<{ ok: boolean; whatsappUrl?: string | null }>('/api/applications/submit', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          roomNumber,
          bedType,
          phone,
          email,
          school,
          address,
          guardianName,
          localGuardianName,
          collegeOrWorkTiming,
          dateOfEntry,
          passportPhotoDataUrl: passportPhoto.dataUrl,
          citizenshipDataUrl: citizenship.dataUrl
        })
      });
      setWhatsappUrl(result.whatsappUrl ?? null);
      setDone(true);
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setError(null);
        setWhatsappUrl(null);
      }}
      title={done ? 'Application Submitted' : 'Ready to Live'}
    >
      {done ? (
        <div className="space-y-3">
          <p className="text-slate-700">
            Your application has been submitted. You will receive login credentials once the admin approves your request.
          </p>
          {whatsappUrl && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">
              A WhatsApp request has been prepared for the admin. If WhatsApp did not open automatically, send it from here.
            </div>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Send Request on WhatsApp
            </a>
          )}
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Student Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Room Number" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
            <Select
              label="Bed Type"
              value={bedType}
              onChange={(e) => setBedType(e.target.value as any)}
              options={[
                { label: '2-Seater', value: '2-Seater' },
                { label: '3-Seater', value: '3-Seater' },
                { label: '4-Seater', value: '4-Seater' },
                { label: '5-Seater', value: '5-Seater' }
              ]}
            />
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
            <Input label="School / College / University" value={school} onChange={(e) => setSchool(e.target.value)} required />
            <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <Input label="Guardian Name" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} required />
            <Input label="Local Guardian Name" value={localGuardianName} onChange={(e) => setLocalGuardianName(e.target.value)} required />
            <Input
              label="College / Work Timing"
              value={collegeOrWorkTiming}
              onChange={(e) => setCollegeOrWorkTiming(e.target.value)}
              required
              placeholder="Example: 6 AM - 12 PM"
            />
            <Input label="Date of Entry" value={dateOfEntry} onChange={(e) => setDateOfEntry(e.target.value)} required type="date" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs font-semibold text-slate-600 mb-1">Passport Size Photo</div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => void handleUpload(e.target.files?.[0], setPassportPhoto)}
                className="w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                required
              />
              <div className="mt-2 text-xs text-slate-500">{passportPhoto?.fileName ?? 'PNG, JPG, or WebP up to 5 MB'}</div>
            </label>

            <label className="block rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs font-semibold text-slate-600 mb-1">Citizenship Image</div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => void handleUpload(e.target.files?.[0], setCitizenship)}
                className="w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                required
              />
              <div className="mt-2 text-xs text-slate-500">{citizenship?.fileName ?? 'PNG, JPG, or WebP up to 5 MB'}</div>
            </label>
          </div>

          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canSubmit || loading} type="button">
              {loading ? 'Saving application...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
