import { Router } from 'express';
import {
  createRequest,
  getNearbyRequests,
  acceptRequest,
  updateRequestStatus,
  getMyRequests,
} from '../controllers/requestController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorizeRoles('PATIENT'), createRequest);
router.get('/nearby', authenticate, authorizeRoles('DOCTOR', 'NURSE', 'AMBULANCE'), getNearbyRequests);
router.get('/my', authenticate, getMyRequests);
router.put('/:id/accept', authenticate, authorizeRoles('DOCTOR', 'NURSE', 'AMBULANCE'), acceptRequest);
router.put('/:id/status', authenticate, updateRequestStatus);

export default router;
