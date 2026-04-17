# Backend Test Flow (General + Renter + Admin)

## 1) Setup

1. Copy `.env.example` to `.env`.
2. Ensure PostgreSQL is running and `DATABASE_URL` is correct.
3. Run:
   - `npm run prisma:generate`
   - `npm run prisma:push`
   - `npm run prisma:seed`
4. Start app: `npm run dev`

## 2) API Flow

### Upload documents
- `POST /api/upload` (multipart/form-data, key: `file`)
- Repeat for:
  - NID or passport
  - driving license
  - car ownership paper
  - passport-size photo

### General user login (Google)
- Use login page and click **Continue with Google**.
- This creates/uses a `GENERAL` user and logs in without renter docs.

### Renter signup
- `POST /api/auth/signup`
- Body:
```json
{
  "fullName": "Renter One",
  "email": "renter@example.com",
  "phone": "+8801711223344",
  "password": "Renter@123",
  "nidOrPassportUrl": "/uploads/xxx",
  "drivingLicenseUrl": "/uploads/xxx",
  "ownershipPaperUrl": "/uploads/xxx",
  "passportPhotoUrl": "/uploads/xxx"
}
```

### Login before approval (expected blocked for renter)
- `POST /api/auth/login`
- Should return 403 when `verificationStatus` is not `APPROVED`.

### Admin login
- Seeded credentials:
  - `admin@motorent.com`
  - `Admin@123`

### Admin review pending renters
- `GET /api/admin/renters/pending`

### Admin approves renter
- `PATCH /api/admin/renters/:id/status`
- Body:
```json
{
  "status": "APPROVED",
  "note": "Documents are valid"
}
```

### Renter login after approval
- `POST /api/auth/login` -> should succeed.

### Renter submits vehicle profile
- `POST /api/vehicles`
- Body:
```json
{
  "brand": "Toyota",
  "model": "Premio",
  "year": 2020,
  "registrationNumber": "DHAKA-METRO-XX-12-3456",
  "dailyRate": 4500,
  "vehiclePhotoUrl": "/uploads/xxx",
  "ownershipPaperUrl": "/uploads/xxx",
  "insurancePaperUrl": "/uploads/xxx"
}
```

### Admin reviews pending vehicles
- `GET /api/admin/vehicles/pending`

### Admin approves vehicle
- `PATCH /api/admin/vehicles/:id/status`
- Body:
```json
{
  "status": "APPROVED",
  "note": "Approved after document check"
}
```
