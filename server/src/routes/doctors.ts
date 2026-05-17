import { Router } from 'express';
import { getNearbyDoctors, updateAvailability, getDoctorProfile } from '../controllers/doctorController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/nearby', getNearbyDoctors);
router.get('/:id', getDoctorProfile);
router.put('/availability', authenticate, authorizeRoles('DOCTOR', 'NURSE', 'AMBULANCE'), updateAvailability);

export default router;
