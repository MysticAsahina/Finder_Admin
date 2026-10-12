import React, { useState, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';


// 50 Sample Applications matching the user's requested screenshot format
export const SAMPLE_DISCOUNT_APPLICATIONS = [
  {
    id: 'DA-001',
    applicant: 'Juan Dela Cruz',
    discountType: 'Student',
    idNumber: 'STU-22-64471',
    submitted: 'September 22, 2026 • 9:14 AM',
    status: 'Pending',
    institution: 'PHINMA Araullo University',
    email: 'j.delacruz@student.phinma.edu.ph',
    phone: '0917-234-5678',
  },
  {
    id: 'DA-002',
    applicant: 'Corazon Villanueva',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NCR-118820',
    submitted: 'September 22, 2026 • 8:47 AM',
    status: 'Pending',
    institution: 'OSCA Cabanatuan City',
    email: 'c.villanueva58@gmail.com',
    phone: '0918-345-6789',
  },
  {
    id: 'DA-003',
    applicant: 'Ramil Fonatnilla',
    discountType: 'PWD',
    idNumber: 'PWD-RIZ-G66632',
    submitted: 'September 21, 2026 • 4:02 PM',
    status: 'Approved',
    institution: 'PDAO Nueva Ecija',
    email: 'ramil.fonatnilla@yahoo.com',
    phone: '0920-456-7890',
  },
  {
    id: 'DA-004',
    applicant: 'Aiza Buenaventura',
    discountType: 'Student',
    idNumber: 'STU-22-09015',
    submitted: 'September 21, 2026 • 2:31 PM',
    status: 'Rejected',
    institution: 'Wesleyan University - Philippines',
    email: 'abuenaventura@wesleyan.edu.ph',
    phone: '0922-567-8901',
    rejectionReason: 'ID card expired; missing current semester validation sticker.',
  },
  {
    id: 'DA-005',
    applicant: 'Bienvenido Sarmiento',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NCR-107234',
    submitted: 'September 20, 2026 • 11:18 AM',
    status: 'Approved',
    institution: 'OSCA Region III',
    email: 'bien.sarmiento@outlook.com',
    phone: '0927-678-9012',
  },
  {
    id: 'DA-006',
    applicant: 'Kristine Oporte',
    discountType: 'PWD',
    idNumber: 'PWD-QC-004481',
    submitted: 'September 19, 2026 • 5:55 PM',
    status: 'Pending',
    institution: 'PDAO Cabanatuan City',
    email: 'kristine.oporte@gmail.com',
    phone: '0935-789-0123',
  },
  {
    id: 'DA-007',
    applicant: 'Mark Anthony Reyes',
    discountType: 'Student',
    idNumber: 'STU-23-11842',
    submitted: 'September 19, 2026 • 3:20 PM',
    status: 'Approved',
    institution: 'Nueva Ecija University of Science and Technology',
    email: 'reyes.mark@neust.edu.ph',
    phone: '0919-890-1234',
  },
  {
    id: 'DA-008',
    applicant: 'Maria Teresa Gonzales',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NE-089412',
    submitted: 'September 19, 2026 • 10:05 AM',
    status: 'Approved',
    institution: 'OSCA Cabanatuan City',
    email: 'mt.gonzales@gmail.com',
    phone: '0917-901-2345',
  },
  {
    id: 'DA-009',
    applicant: 'Eduardo De Guzman',
    discountType: 'PWD',
    idNumber: 'PWD-NE-034192',
    submitted: 'September 18, 2026 • 4:45 PM',
    status: 'Pending',
    institution: 'PDAO Nueva Ecija',
    email: 'ed.deguzman@yahoo.com',
    phone: '0928-012-3456',
  },
  {
    id: 'DA-010',
    applicant: 'Angelica Mae Santos',
    discountType: 'Student',
    idNumber: 'STU-24-00418',
    submitted: 'September 18, 2026 • 1:15 PM',
    status: 'Approved',
    institution: 'Central Luzon State University',
    email: 'amsantos@clsu.edu.ph',
    phone: '0939-123-4567',
  },
  {
    id: 'DA-011',
    applicant: 'Rodrigo Manlapaz',
    discountType: 'Senior Citizen',
    idNumber: 'SC-BUL-092314',
    submitted: 'September 18, 2026 • 9:30 AM',
    status: 'Pending',
    institution: 'OSCA San Jose City',
    email: 'rmanlapaz@gmail.com',
    phone: '0926-234-5678',
  },
  {
    id: 'DA-012',
    applicant: 'Patricia Ann Lim',
    discountType: 'Student',
    idNumber: 'STU-23-44910',
    submitted: 'September 17, 2026 • 4:10 PM',
    status: 'Approved',
    institution: 'PHINMA Araullo University',
    email: 'pa.lim@student.phinma.edu.ph',
    phone: '0945-345-6789',
  },
  {
    id: 'DA-013',
    applicant: 'Danilo Alcantara',
    discountType: 'PWD',
    idNumber: 'PWD-NE-088192',
    submitted: 'September 17, 2026 • 11:42 AM',
    status: 'Rejected',
    institution: 'PDAO Cabanatuan City',
    email: 'danilo.alcantara@hotmail.com',
    phone: '0917-456-7890',
    rejectionReason: 'Medical assessment certificate not attached.',
  },
  {
    id: 'DA-014',
    applicant: 'Carmela Bautista',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NE-149201',
    submitted: 'September 16, 2026 • 2:20 PM',
    status: 'Approved',
    institution: 'OSCA Gapan City',
    email: 'carmela.bautista@gmail.com',
    phone: '0918-567-8901',
  },
  {
    id: 'DA-015',
    applicant: 'Joshua Miguel Tan',
    discountType: 'Student',
    idNumber: 'STU-24-18490',
    submitted: 'September 16, 2026 • 10:18 AM',
    status: 'Pending',
    institution: 'Wesleyan University - Philippines',
    email: 'jmtan@wesleyan.edu.ph',
    phone: '0929-678-9012',
  },
  {
    id: 'DA-016',
    applicant: 'Lourdes Ramos',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NE-102941',
    submitted: 'September 15, 2026 • 3:50 PM',
    status: 'Approved',
    institution: 'OSCA Cabanatuan City',
    email: 'lourdes.ramos@yahoo.com',
    phone: '0932-789-0123',
  },
  {
    id: 'DA-017',
    applicant: 'Francis Jerome Diaz',
    discountType: 'Student',
    idNumber: 'STU-22-38491',
    submitted: 'September 15, 2026 • 1:40 PM',
    status: 'Approved',
    institution: 'NEUST San Isidro Campus',
    email: 'fjdiaz@neust.edu.ph',
    phone: '0947-890-1234',
  },
  {
    id: 'DA-018',
    applicant: 'Gregoria Mercado',
    discountType: 'PWD',
    idNumber: 'PWD-RIZ-889120',
    submitted: 'September 14, 2026 • 4:25 PM',
    status: 'Pending',
    institution: 'PDAO Nueva Ecija',
    email: 'gregoria.m@gmail.com',
    phone: '0917-901-2345',
  },
  {
    id: 'DA-019',
    applicant: 'Antonio Mendoza Jr.',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NCR-094182',
    submitted: 'September 14, 2026 • 11:10 AM',
    status: 'Approved',
    institution: 'OSCA Cabanatuan City',
    email: 'antonio.mendoza@gmail.com',
    phone: '0920-012-3456',
  },
  {
    id: 'DA-020',
    applicant: 'Bea Nicole Castro',
    discountType: 'Student',
    idNumber: 'STU-24-99182',
    submitted: 'September 13, 2026 • 5:12 PM',
    status: 'Pending',
    institution: 'Central Luzon State University',
    email: 'bncastro@clsu.edu.ph',
    phone: '0933-123-4567',
  },
  {
    id: 'DA-021',
    applicant: 'Renato Salvador',
    discountType: 'PWD',
    idNumber: 'PWD-NE-041920',
    submitted: 'September 13, 2026 • 2:45 PM',
    status: 'Approved',
    institution: 'PDAO Cabanatuan City',
    email: 'renato.salvador@yahoo.com',
    phone: '0915-234-5678',
  },
  {
    id: 'DA-022',
    applicant: 'Victoria Morales',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NE-088190',
    submitted: 'September 12, 2026 • 10:30 AM',
    status: 'Rejected',
    institution: 'OSCA Palayan City',
    email: 'vmorales52@gmail.com',
    phone: '0928-345-6789',
    rejectionReason: 'ID photo could not be verified; name mismatch on birth certificate.',
  },
  {
    id: 'DA-023',
    applicant: 'Christian David Ramos',
    discountType: 'Student',
    idNumber: 'STU-23-77291',
    submitted: 'September 12, 2026 • 9:15 AM',
    status: 'Approved',
    institution: 'PHINMA Araullo University',
    email: 'cdramos@student.phinma.edu.ph',
    phone: '0949-456-7890',
  },
  {
    id: 'DA-024',
    applicant: 'Rosalinda Cruz',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NCR-228190',
    submitted: 'September 11, 2026 • 3:20 PM',
    status: 'Pending',
    institution: 'OSCA Cabanatuan City',
    email: 'rosalinda.cruz@outlook.com',
    phone: '0916-567-8901',
  },
  {
    id: 'DA-025',
    applicant: 'Jeffrey Tolentino',
    discountType: 'PWD',
    idNumber: 'PWD-NE-102941',
    submitted: 'September 11, 2026 • 1:55 PM',
    status: 'Approved',
    institution: 'PDAO Talavera Chapter',
    email: 'jeff.tolentino@gmail.com',
    phone: '0927-678-9012',
  },
  {
    id: 'DA-026',
    applicant: 'Christine Joy Valenzuela',
    discountType: 'Student',
    idNumber: 'STU-24-38291',
    submitted: 'September 10, 2026 • 4:40 PM',
    status: 'Pending',
    institution: 'Wesleyan University - Philippines',
    email: 'cvalenzuela@wesleyan.edu.ph',
    phone: '0936-789-0123',
  },
  {
    id: 'DA-027',
    applicant: 'Manuel Del Rosario',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NE-110294',
    submitted: 'September 10, 2026 • 11:05 AM',
    status: 'Approved',
    institution: 'OSCA Cabanatuan City',
    email: 'manuel.delrosario@yahoo.com',
    phone: '0948-890-1234',
  },
  {
    id: 'DA-028',
    applicant: 'Kimberly Jane Flores',
    discountType: 'Student',
    idNumber: 'STU-22-88192',
    submitted: 'September 09, 2026 • 2:15 PM',
    status: 'Approved',
    institution: 'NEUST Cabanatuan Campus',
    email: 'kjflores@neust.edu.ph',
    phone: '0917-901-2345',
  },
  {
    id: 'DA-029',
    applicant: 'Nestor Pineda',
    discountType: 'PWD',
    idNumber: 'PWD-QC-091823',
    submitted: 'September 09, 2026 • 9:50 AM',
    status: 'Rejected',
    institution: 'PDAO Cabanatuan City',
    email: 'nestor.pineda@gmail.com',
    phone: '0922-012-3456',
    rejectionReason: 'ID image cut off; bar code unreadable.',
  },
  {
    id: 'DA-030',
    applicant: 'Esperanza Garcia',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NCR-119283',
    submitted: 'September 08, 2026 • 4:15 PM',
    status: 'Approved',
    institution: 'OSCA Cabanatuan City',
    email: 'espie.garcia@gmail.com',
    phone: '0935-123-4567',
  },
  {
    id: 'DA-031',
    applicant: 'Kevin Paul Soriano',
    discountType: 'Student',
    idNumber: 'STU-23-48190',
    submitted: 'September 08, 2026 • 1:30 PM',
    status: 'Pending',
    institution: 'PHINMA Araullo University',
    email: 'kpsoriano@student.phinma.edu.ph',
    phone: '0918-234-5678',
  },
  {
    id: 'DA-032',
    applicant: 'Rogelio Aquino',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NE-159281',
    submitted: 'September 07, 2026 • 3:45 PM',
    status: 'Approved',
    institution: 'OSCA San Jose City',
    email: 'rogelio.aquino@yahoo.com',
    phone: '0929-345-6789',
  },
  {
    id: 'DA-033',
    applicant: 'Marites Gutierrez',
    discountType: 'PWD',
    idNumber: 'PWD-NE-081924',
    submitted: 'September 07, 2026 • 10:20 AM',
    status: 'Approved',
    institution: 'PDAO Nueva Ecija',
    email: 'marites.g@gmail.com',
    phone: '0946-456-7890',
  },
  {
    id: 'DA-034',
    applicant: 'Daniel John Dizon',
    discountType: 'Student',
    idNumber: 'STU-24-11029',
    submitted: 'September 06, 2026 • 4:05 PM',
    status: 'Pending',
    institution: 'Central Luzon State University',
    email: 'djdizon@clsu.edu.ph',
    phone: '0917-567-8901',
  },
  {
    id: 'DA-035',
    applicant: 'Remedios Pascual',
    discountType: 'Senior Citizen',
    idNumber: 'SC-BUL-119280',
    submitted: 'September 06, 2026 • 11:35 AM',
    status: 'Approved',
    institution: 'OSCA Cabanatuan City',
    email: 'remedios.pascual@gmail.com',
    phone: '0920-678-9012',
  },
  {
    id: 'DA-036',
    applicant: 'Althea Rose Navarro',
    discountType: 'Student',
    idNumber: 'STU-23-99182',
    submitted: 'September 05, 2026 • 2:50 PM',
    status: 'Approved',
    institution: 'Wesleyan University - Philippines',
    email: 'arnavarro@wesleyan.edu.ph',
    phone: '0933-789-0123',
  },
  {
    id: 'DA-037',
    applicant: 'Benjamin Castillo',
    discountType: 'PWD',
    idNumber: 'PWD-RIZ-109281',
    submitted: 'September 05, 2026 • 9:15 AM',
    status: 'Pending',
    institution: 'PDAO Nueva Ecija',
    email: 'benjie.castillo@yahoo.com',
    phone: '0919-890-1234',
  },
  {
    id: 'DA-038',
    applicant: 'Milagros Corpuz',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NE-092819',
    submitted: 'September 04, 2026 • 3:10 PM',
    status: 'Approved',
    institution: 'OSCA Gapan City',
    email: 'milagros.corpuz@gmail.com',
    phone: '0926-901-2345',
  },
  {
    id: 'DA-039',
    applicant: 'John Carlo Perez',
    discountType: 'Student',
    idNumber: 'STU-22-48192',
    submitted: 'September 04, 2026 • 10:45 AM',
    status: 'Rejected',
    institution: 'NEUST Cabanatuan Campus',
    email: 'jcperez@neust.edu.ph',
    phone: '0945-012-3456',
    rejectionReason: 'ID issued to another student; duplicate record detected.',
  },
  {
    id: 'DA-040',
    applicant: 'Felipe Miranda',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NCR-182910',
    submitted: 'September 03, 2026 • 4:30 PM',
    status: 'Approved',
    institution: 'OSCA Cabanatuan City',
    email: 'felipe.miranda@hotmail.com',
    phone: '0917-123-4567',
  },
  {
    id: 'DA-041',
    applicant: 'Arlene Ocampo',
    discountType: 'PWD',
    idNumber: 'PWD-NE-089123',
    submitted: 'September 03, 2026 • 1:10 PM',
    status: 'Pending',
    institution: 'PDAO Cabanatuan City',
    email: 'arlene.ocampo@gmail.com',
    phone: '0928-234-5678',
  },
  {
    id: 'DA-042',
    applicant: 'Stephanie Grace David',
    discountType: 'Student',
    idNumber: 'STU-24-55190',
    submitted: 'September 02, 2026 • 3:40 PM',
    status: 'Approved',
    institution: 'PHINMA Araullo University',
    email: 'sgdavid@student.phinma.edu.ph',
    phone: '0939-345-6789',
  },
  {
    id: 'DA-043',
    applicant: 'Dominador Evangelista',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NE-102918',
    submitted: 'September 02, 2026 • 9:25 AM',
    status: 'Approved',
    institution: 'OSCA Palayan City',
    email: 'doming.e@gmail.com',
    phone: '0915-456-7890',
  },
  {
    id: 'DA-044',
    applicant: 'Mary Ann Villanueva',
    discountType: 'PWD',
    idNumber: 'PWD-QC-081920',
    submitted: 'September 01, 2026 • 2:15 PM',
    status: 'Pending',
    institution: 'PDAO Nueva Ecija',
    email: 'mavillanueva@yahoo.com',
    phone: '0927-567-8901',
  },
  {
    id: 'DA-045',
    applicant: 'Gabriel Matthew Santiago',
    discountType: 'Student',
    idNumber: 'STU-23-00192',
    submitted: 'September 01, 2026 • 11:00 AM',
    status: 'Approved',
    institution: 'Central Luzon State University',
    email: 'gmsantiago@clsu.edu.ph',
    phone: '0936-678-9012',
  },
  {
    id: 'DA-046',
    applicant: 'Josefina Dela Rosa',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NCR-092819',
    submitted: 'August 31, 2026 • 4:50 PM',
    status: 'Approved',
    institution: 'OSCA Cabanatuan City',
    email: 'josefina.delarosa@gmail.com',
    phone: '0948-789-0123',
  },
  {
    id: 'DA-047',
    applicant: 'Ronald Allan Cortez',
    discountType: 'PWD',
    idNumber: 'PWD-NE-192801',
    submitted: 'August 31, 2026 • 1:20 PM',
    status: 'Rejected',
    institution: 'PDAO Cabanatuan City',
    email: 'ronald.cortez@gmail.com',
    phone: '0917-890-1234',
    rejectionReason: 'Government PWD ID expired; renewal required.',
  },
  {
    id: 'DA-048',
    applicant: 'Hannah Sofia Rivera',
    discountType: 'Student',
    idNumber: 'STU-24-81920',
    submitted: 'August 30, 2026 • 3:35 PM',
    status: 'Approved',
    institution: 'Wesleyan University - Philippines',
    email: 'hsrivera@wesleyan.edu.ph',
    phone: '0922-901-2345',
  },
  {
    id: 'DA-049',
    applicant: 'Jaime Concepcion',
    discountType: 'Senior Citizen',
    idNumber: 'SC-NE-149204',
    submitted: 'August 30, 2026 • 10:15 AM',
    status: 'Pending',
    institution: 'OSCA Cabanatuan City',
    email: 'jaime.concepcion@yahoo.com',
    phone: '0935-012-3456',
  },
  {
    id: 'DA-050',
    applicant: 'Grace Lynn Marquez',
    discountType: 'PWD',
    idNumber: 'PWD-RIZ-089123',
    submitted: 'August 29, 2026 • 4:45 PM',
    status: 'Approved',
    institution: 'PDAO Nueva Ecija',
    email: 'grace.marquez@gmail.com',
    phone: '0918-123-4567',
  },
];

function getAppDetails(app) {
  if (!app) return {};

  const initials = app.applicant
    ? app.applicant
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'JD';

  const rawPhone = app.phone || '0917 234 5678';
  const mobileNumber = rawPhone.replace(/-/g, ' ');

  let submittedStr = app.submitted ? new Date(app.submitted).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A';
  if (submittedStr.startsWith('September')) {
    submittedStr = submittedStr.replace('September', 'Sep');
  }

  let idType = 'Student ID';
  if (app.discountType === 'Senior Citizen') {
    idType = 'Senior Citizen ID';
  } else if (app.discountType === 'PWD') {
    idType = 'PWD Identification ID';
  }

  let dob = '08 / 14 / 2004';
  if (app.discountType === 'Senior Citizen') {
    dob = '05 / 22 / 1958';
  } else if (app.discountType === 'PWD') {
    dob = '11 / 03 / 1989';
  }

  let expirationDate = '06 / 30 / 2027';
  if (app.discountType === 'Senior Citizen') {
    expirationDate = 'Lifetime';
  } else if (app.discountType === 'PWD') {
    expirationDate = '10 / 18 / 2029';
  }

  return {
    initials,
    mobileNumber,
    submittedStr,
    idType,
    dob,
    expirationDate,
  };
}

export default function DiscountApplications({ isActive }) {
  const { accessToken } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'Student' | 'Senior Citizen' | 'PWD'
  const [selectedApp, setSelectedApp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const fetchApplications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/discount-applications`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error("Failed to fetch discount applications", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!isActive) return;
    fetchApplications(true);
    const interval = setInterval(() => {
      fetchApplications(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Status counts
  const counts = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'Pending').length;
    const approved = applications.filter((a) => a.status === 'Approved').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [applications]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (activeFilter !== 'All' && app.status !== activeFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'ALL' && app.discountType !== typeFilter) {
        return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = app.applicant.toLowerCase().includes(term);
        const matchesId = app.idNumber.toLowerCase().includes(term);
        const matchesType = app.discountType.toLowerCase().includes(term);
        if (!matchesName && !matchesId && !matchesType) return false;
      }
      return true;
    });
  }, [applications, activeFilter, typeFilter, searchTerm]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, typeFilter, searchTerm]);

  // Paginated applications
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApps.slice(start, start + pageSize);
  }, [filteredApps, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredApps.length / pageSize) || 1;

  // Actions
  const handleUpdateStatus = async (appId, newStatus, reason = '') => {
    try {
      // If rejecting, we simulate deletion from backend or update status. 
      // The user requested "Rejected ones are removed from the database entirely."
      // Since it's an API, the backend should handle the deletion upon rejection, 
      // but on the frontend we must remove it from the state.
      const res = await fetch(`${API_URL}/admin/discount-applications/${appId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, reason })
      });
      if (res.ok) {
        import('sweetalert2').then(({ default: Swal }) => {
          Swal.fire('Success', `Application successfully ${newStatus.toLowerCase()}.`, 'success');
        });
        
        if (newStatus === 'Rejected') {
           setApplications((prev) => prev.filter((app) => app.id !== appId));
        } else {
           setApplications((prev) =>
             prev.map((app) => {
               if (app.id === appId) {
                 return { ...app, status: newStatus };
               }
               return app;
             })
           );
        }
        setSelectedApp(null); // Close the modal
      } else {
        const errData = await res.json();
        import('sweetalert2').then(({ default: Swal }) => {
          Swal.fire('Error', errData.message || 'Failed to update application status.', 'error');
        });
      }
    } catch (e) {
      console.error(e);
      import('sweetalert2').then(({ default: Swal }) => {
        Swal.fire('Error', 'Network error while updating status.', 'error');
      });
    }
  };

  const handleResetToDefault = () => {
    fetchApplications();
  };

  return (
    <div style={styles.container}>
      {/* ── Subheader / Control bar matching user screenshot ─────────────── */}
      <div style={styles.topControlRow}>
        <div style={styles.searchWrap}>
          <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by applicant or ID number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button style={styles.clearSearchBtn} onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs matching exact screenshot */}
        <div style={styles.filterPillGroup}>
          {[
            { key: 'All', label: 'All', count: counts.total - counts.rejected },
            { key: 'Pending', label: 'Pending', count: counts.pending },
            { key: 'Approved', label: 'Approved', count: counts.approved },
          ].map((tab) => {
            const isFilterActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                style={{
                  ...styles.filterTabBtn,
                  ...(isFilterActive ? styles.filterTabBtnActive : {}),
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table Card Container ────────────────────────────────────────── */}
      <div style={styles.tableCard}>
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.th, width: '22%' }}>APPLICANT</th>
                <th style={{ ...styles.th, width: '18%' }}>DISCOUNT TYPE</th>
                <th style={{ ...styles.th, width: '20%' }}>ID NUMBER</th>
                <th style={{ ...styles.th, width: '25%' }}>SUBMITTED</th>
                <th style={{ ...styles.th, width: '15%', textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={5} style={styles.emptyCell}>
                    <div style={styles.emptyWrap}>
                      <span style={{ fontSize: '2rem' }}>📋</span>
                      <p style={styles.emptyTitle}>No applications found</p>
                      <p style={styles.emptySub}>Try adjusting your search or status filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr
                    key={app.id}
                    style={styles.tableRow}
                    onClick={() => setSelectedApp(app)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF7F5')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* APPLICANT */}
                    <td style={styles.td}>
                      <span style={styles.applicantName}>{app.applicant}</span>
                    </td>

                    {/* DISCOUNT TYPE */}
                    <td style={styles.td}>
                      <span style={styles.discountTypeTxt}>{app.discountType}</span>
                    </td>

                    {/* ID NUMBER */}
                    <td style={styles.td}>
                      <span style={styles.idNumberTxt}>{app.idNumber}</span>
                    </td>

                    {/* SUBMITTED */}
                    <td style={styles.td}>
                      <span style={styles.submittedTxt}>{app.submitted ? new Date(app.submitted).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A'}</span>
                    </td>

                    {/* STATUS */}
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(app.status === 'Pending' ? styles.statusBadgePending : {}),
                          ...(app.status === 'Approved' ? styles.statusBadgeApproved : {}),
                          ...(app.status === 'Rejected' ? styles.statusBadgeRejected : {}),
                        }}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer / Pagination ──────────────────────────────────── */}
        <div style={styles.tableFooter}>
          <div style={styles.footerInfo}>
            Showing <strong style={{ color: '#1c1410' }}>{(currentPage - 1) * pageSize + (paginatedApps.length > 0 ? 1 : 0)}</strong> to{' '}
            <strong style={{ color: '#1c1410' }}>{Math.min(currentPage * pageSize, filteredApps.length)}</strong> of{' '}
            <strong style={{ color: '#1c1410' }}>{filteredApps.length}</strong> applications (Total Sample: 50)
          </div>

          <div style={styles.paginationControls}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={styles.pageSizeSelect}
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button
              style={{ ...styles.pageBtn, ...(currentPage === 1 ? styles.pageBtnDisabled : {}) }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </button>
            <span style={styles.pageIndicator}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              style={{ ...styles.pageBtn, ...(currentPage === totalPages ? styles.pageBtnDisabled : {}) }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>

            {/* Quick reset samples button */}
            <button style={styles.resetBtn} onClick={handleResetToDefault} title="Reset all 50 sample applications">
              ↻ Reset 50
            </button>
          </div>
        </div>
      </div>

      {/* ── Detail / Action Modal matching user screenshot ─────────────── */}
      {selectedApp && (() => {
        const details = getAppDetails(selectedApp);
        return (
          <div style={styles.modalOverlay} onClick={() => setSelectedApp(null)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>

              {/* Top Banner Card: Orange square avatar + Name */}
              <div style={styles.modalTopBanner}>
                <div style={styles.modalAvatarBox}>
                  {details.initials}
                </div>
                <div style={styles.modalApplicantName}>
                  {selectedApp.applicant}
                </div>
                <button
                  style={styles.modalDismissBtn}
                  onClick={() => setSelectedApp(null)}
                  title="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* 2-Column Info Cards */}
              <div style={styles.modalGridRow}>
                {/* Left Card: Application Details */}
                <div style={styles.modalSubCard}>
                  <div style={styles.modalCardHeader}>
                    Application Details
                  </div>
                  <div style={styles.modalSubCardDivider} />

                  <div style={styles.modalFieldsGrid}>
                    <div>
                      <div style={styles.fieldLabel}>Discount type</div>
                      <div style={styles.fieldValue}>{selectedApp.discountType}</div>
                    </div>
                    <div>
                      <div style={styles.fieldLabel}>Mobile number</div>
                      <div style={styles.fieldValue}>{details.mobileNumber}</div>
                    </div>
                    <div>
                      <div style={styles.fieldLabel}>Date of birth</div>
                      <div style={styles.fieldValue}>{details.dob}</div>
                    </div>
                    <div>
                      <div style={styles.fieldLabel}>Submitted</div>
                      <div style={styles.fieldValue}>{details.submittedStr}</div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Supporting ID */}
                <div style={styles.modalSubCard}>
                  <div style={styles.modalCardHeader}>
                    Supporting ID
                  </div>
                  <div style={styles.modalSubCardDivider} />

                  <div style={styles.modalFieldsGrid}>
                    <div>
                      <div style={styles.fieldLabel}>ID type</div>
                      <div style={styles.fieldValue}>{details.idType}</div>
                    </div>
                    <div>
                      <div style={styles.fieldLabel}>ID number</div>
                      <div style={styles.fieldValue}>{selectedApp.idNumber}</div>
                    </div>
                    <div>
                      <div style={styles.fieldLabel}>Expiration Date</div>
                      <div style={styles.fieldValue}>{details.expirationDate}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Box */}
              <div style={selectedApp.imageUri ? styles.modalPhotoBoxWithImage : styles.modalPhotoBox}>
                {selectedApp.imageUri ? (
                  <img src={selectedApp.imageUri} alt="ID Card" style={styles.modalPhotoImage} />
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span style={styles.modalPhotoLabel}>NO IMAGE</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div style={styles.modalActionRow}>
                {selectedApp.status === 'Approved' ? (
                  <button
                    style={styles.modalRejectBtn}
                    onClick={() => {
                      handleUpdateStatus(selectedApp.id, 'Rejected');
                      setSelectedApp(null);
                    }}
                  >
                    Invalidate Discount
                  </button>
                ) : (
                  <>
                    <button
                      style={styles.modalApproveBtn}
                      onClick={() => {
                        handleUpdateStatus(selectedApp.id, 'Approved');
                        setSelectedApp(null);
                      }}
                    >
                      Approve Application
                    </button>
                    <button
                      style={styles.modalRejectBtn}
                      onClick={() => {
                        handleUpdateStatus(selectedApp.id, 'Rejected');
                        setSelectedApp(null);
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: 'calc(100vh - 120px)',
    minHeight: '480px',
  },
  topControlRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    flexShrink: 0,
    zIndex: 5,
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '280px',
    maxWidth: '420px',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    width: '16px',
    height: '16px',
    color: '#9CA3AF',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 34px 9px 36px',
    borderRadius: '10px',
    border: '1.5px solid var(--border, #ecddd4)',
    background: '#ffffff',
    fontSize: '0.85rem',
    color: 'var(--text, #1c1410)',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '2px 4px',
  },

  // Filter tabs matching the screenshot
  filterPillGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1.5px solid #ecddd4',
    borderRadius: '10px',
    padding: '3px',
    gap: '4px',
  },
  filterTabBtn: {
    border: 'none',
    background: 'transparent',
    color: '#6B7280',
    fontSize: '0.82rem',
    fontWeight: '600',
    padding: '6px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  filterTabBtnActive: {
    backgroundColor: '#FA7528', // FINDER orange
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(250, 117, 40, 0.28)',
  },

  // Table Card with dedicated scrollable container
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  tableResponsive: {
    overflowY: 'auto',
    overflowX: 'auto',
    flex: 1,
    minHeight: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
  },
  tableHeaderRow: {
    backgroundColor: '#ffffff',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
  th: {
    padding: '16px 20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.06em',
    color: '#6B7280',
    textTransform: 'uppercase',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #E5E7EB',
  },
  tableRow: {
    borderBottom: '1px solid #F3F4F6',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '15px 20px',
    verticalAlign: 'middle',
  },
  applicantCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  applicantAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#FFF4ED',
    color: '#FA7528',
    border: '1px solid #FFD0B0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800',
    flexShrink: 0,
  },
  applicantName: {
    fontWeight: '600',
    color: '#1C1410',
    fontSize: '0.88rem',
  },
  discountTypeTxt: {
    color: '#374151',
    fontSize: '0.88rem',
    fontWeight: '500',
  },
  idNumberTxt: {
    color: '#1F2937',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.2px',
  },
  submittedTxt: {
    color: '#4B5563',
    fontSize: '0.85rem',
  },

  // Status badges matching screenshot
  statusBadge: {
    display: 'inline-block',
    padding: '4px 18px',
    borderRadius: '20px',
    fontSize: '11.5px',
    fontWeight: '700',
    letterSpacing: '0.2px',
    textAlign: 'center',
    minWidth: '82px',
  },
  statusBadgePending: {
    backgroundColor: '#FFFBEB',
    color: '#D97706',
    border: '1px solid #FDE68A',
  },
  statusBadgeApproved: {
    backgroundColor: '#ECFDF5',
    color: '#16A34A',
    border: '1px solid #A7F3D0',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FECACA',
  },

  emptyCell: {
    padding: '48px 20px',
    textAlign: 'center',
  },
  emptyWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  emptyTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#374151',
    marginTop: '6px',
  },
  emptySub: {
    fontSize: '0.82rem',
    color: '#9CA3AF',
  },

  // Table Footer
  tableFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderTop: '1px solid #E5E7EB',
    backgroundColor: '#FAFAFA',
    flexWrap: 'wrap',
    gap: '12px',
    flexShrink: 0,
  },
  pageSizeSelect: {
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#ffffff',
    fontSize: '0.8rem',
    color: '#374151',
    cursor: 'pointer',
    outline: 'none',
  },
  footerInfo: {
    fontSize: '0.82rem',
    color: '#6B7280',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pageBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  pageIndicator: {
    fontSize: '0.8rem',
    color: '#6B7280',
    padding: '0 4px',
  },
  resetBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #FFD0B0',
    backgroundColor: '#FFF4ED',
    color: '#FA7528',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginLeft: '6px',
  },

  // Detail Modal matching user mockup
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '650px',
    padding: '24px',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.16)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  modalTopBanner: {
    backgroundColor: '#FAF5F0',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
  },
  modalAvatarBox: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: '#FA7528',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  modalApplicantName: {
    fontSize: '1.18rem',
    fontWeight: '700',
    color: '#1C1410',
    flex: 1,
  },
  modalDismissBtn: {
    background: 'none',
    border: 'none',
    color: '#9CA3AF',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '6px',
    lineHeight: 1,
    borderRadius: '6px',
  },
  modalGridRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginTop: '16px',
  },
  modalSubCard: {
    backgroundColor: '#FAF5F0',
    borderRadius: '12px',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
  },
  modalCardHeader: {
    fontSize: '0.92rem',
    fontWeight: '700',
    color: '#1C1410',
  },
  modalSubCardDivider: {
    height: '1px',
    backgroundColor: '#EBE3DC',
    margin: '10px 0 14px 0',
  },
  modalFieldsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: '14px',
    rowGap: '12px',
  },
  fieldLabel: {
    fontSize: '0.78rem',
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: '2px',
  },
  fieldValue: {
    fontSize: '0.86rem',
    color: '#111827',
    fontWeight: '700',
  },
  modalPhotoBox: {
    backgroundColor: '#FAF5F0',
    borderRadius: '12px',
    height: '130px',
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#6B7280',
  },
  modalPhotoBoxWithImage: {
    backgroundColor: '#FAF5F0',
    borderRadius: '12px',
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalPhotoImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: '12px',
  },
  modalPhotoLabel: {
    fontSize: '0.92rem',
    fontWeight: '600',
    color: '#6B7280',
  },
  modalActionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '22px',
  },
  modalApproveBtn: {
    flex: 1,
    backgroundColor: '#FA7528',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    height: '46px',
    fontSize: '0.92rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  },
  modalRejectBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1.5px solid #D1D5DB',
    borderRadius: '10px',
    height: '46px',
    fontSize: '0.92rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
};