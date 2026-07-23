# Spring Boot Backend - Nearby Members (GPS-Based)

The frontend now captures **latitude/longitude** when registering members and calls a backend endpoint that uses the **Haversine formula** to find nearby members by distance.

---

## Overview of Changes

1. Add `latitude` and `longitude` fields to the `Members` entity
2. Add `latitude` and `longitude` fields to the `Address` entity (branch location)
3. Create a DTO for the nearby members response
4. Create a native SQL query using the Haversine formula
5. Create a service method
6. Create a controller endpoint

---

## 1. Entity Update: `Members.java`

Add these two fields to your existing `Members` entity:

```java
@Column(name = "latitude")
private Double latitude;

@Column(name = "longitude")
private Double longitude;
```

Add getters and setters. The frontend registration payload (`POST /api/member/register`) now sends these fields:

```json
{
  "name": "John",
  "surname": "Doe",
  "latitude": -26.2041,
  "longitude": 28.0473,
  "residentialAddress": "10 Main Road, Johannesburg",
  ...
}
```

Make sure your registration logic (`MemberService` or wherever you handle `/api/member/register`) maps these fields from the request body to the entity.

---

## 2. Entity Update: `Address.java` (Branch Location)

Add lat/lng to your `Address` entity so each branch/church has a GPS location:

```java
@Column(name = "latitude")
private Double latitude;

@Column(name = "longitude")
private Double longitude;
```

You'll need to set these for each branch — either via an admin UI or by manually updating the database. The frontend `ManageChurchAddresses` page could be extended to capture this, or you can seed it directly:

```sql
UPDATE address SET latitude = -26.2041, longitude = 28.0473 WHERE id = 1;
```

---

## 3. DTO: `NearbyMemberDTO.java` (package: `com.vyg.dto`)

```java
package com.vyg.dto;

public class NearbyMemberDTO {
    private Long id;
    private String name;
    private String surname;
    private String residentialAddress;
    private String cellNumber;
    private Double distanceKm;
    private String nationName;
    private String branchName;

    // Constructors
    public NearbyMemberDTO() {}

    public NearbyMemberDTO(Long id, String name, String surname, String residentialAddress,
                           String cellNumber, Double distanceKm, String nationName, String branchName) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.residentialAddress = residentialAddress;
        this.cellNumber = cellNumber;
        this.distanceKm = distanceKm;
        this.nationName = nationName;
        this.branchName = branchName;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }

    public String getResidentialAddress() { return residentialAddress; }
    public void setResidentialAddress(String residentialAddress) { this.residentialAddress = residentialAddress; }

    public String getCellNumber() { return cellNumber; }
    public void setCellNumber(String cellNumber) { this.cellNumber = cellNumber; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getNationName() { return nationName; }
    public void setNationName(String nationName) { this.nationName = nationName; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }
}
```

---

## 4. DTO: `NearbyMembersResponse.java` (package: `com.vyg.dto`)

```java
package com.vyg.dto;

import java.util.List;

public class NearbyMembersResponse {
    private String branchAddress;
    private Double branchLat;
    private Double branchLng;
    private List<NearbyMemberDTO> members;

    // Constructors
    public NearbyMembersResponse() {}

    public NearbyMembersResponse(String branchAddress, Double branchLat, Double branchLng, List<NearbyMemberDTO> members) {
        this.branchAddress = branchAddress;
        this.branchLat = branchLat;
        this.branchLng = branchLng;
        this.members = members;
    }

    // Getters and setters
    public String getBranchAddress() { return branchAddress; }
    public void setBranchAddress(String branchAddress) { this.branchAddress = branchAddress; }

    public Double getBranchLat() { return branchLat; }
    public void setBranchLat(Double branchLat) { this.branchLat = branchLat; }

    public Double getBranchLng() { return branchLng; }
    public void setBranchLng(Double branchLng) { this.branchLng = branchLng; }

    public List<NearbyMemberDTO> getMembers() { return members; }
    public void setMembers(List<NearbyMemberDTO> members) { this.members = members; }
}
```

---

## 5. Repository: `MemberRepository.java` — Add Haversine Query

Add this native query method to your existing `MemberRepository`:

```java
@Query(value = """
    SELECT m.id, m.name, m.surname, m.residential_address, m.cell_number,
           (6371 * acos(
               cos(radians(:lat)) * cos(radians(m.latitude)) *
               cos(radians(m.longitude) - radians(:lng)) +
               sin(radians(:lat)) * sin(radians(m.latitude))
           )) AS distance_km,
           n.nation AS nation_name,
           a.branch AS branch_name
    FROM members m
    LEFT JOIN nation n ON m.nation_id = n.id
    LEFT JOIN address a ON m.address_id = a.id
    WHERE m.latitude IS NOT NULL
      AND m.longitude IS NOT NULL
      AND m.is_active = true
    HAVING distance_km <= :radiusKm
    ORDER BY distance_km ASC
    """, nativeQuery = true)
List<Object[]> findNearbyMembers(
    @Param("lat") Double lat,
    @Param("lng") Double lng,
    @Param("radiusKm") Double radiusKm
);
```

**Important:** If your database is PostgreSQL, replace `HAVING` with a subquery or wrap it in a WHERE clause:

```java
// PostgreSQL version:
@Query(value = """
    SELECT * FROM (
        SELECT m.id, m.name, m.surname, m.residential_address, m.cell_number,
               (6371 * acos(
                   cos(radians(:lat)) * cos(radians(m.latitude)) *
                   cos(radians(m.longitude) - radians(:lng)) +
                   sin(radians(:lat)) * sin(radians(m.latitude))
               )) AS distance_km,
               n.nation AS nation_name,
               a.branch AS branch_name
        FROM members m
        LEFT JOIN nation n ON m.nation_id = n.id
        LEFT JOIN address a ON m.address_id = a.id
        WHERE m.latitude IS NOT NULL
          AND m.longitude IS NOT NULL
          AND m.is_active = true
    ) AS nearby
    WHERE distance_km <= :radiusKm
    ORDER BY distance_km ASC
    """, nativeQuery = true)
List<Object[]> findNearbyMembers(
    @Param("lat") Double lat,
    @Param("lng") Double lng,
    @Param("radiusKm") Double radiusKm
);
```

---

## 6. Service: `MemberService.java` — Add Method

```java
public NearbyMembersResponse getNearbyMembers(Long addressId, Double radiusKm) {
    // Get the branch address with its coordinates
    Address branch = addressRepository.findById(addressId)
        .orElseThrow(() -> new RuntimeException("Branch not found"));

    if (branch.getLatitude() == null || branch.getLongitude() == null) {
        throw new RuntimeException("Branch does not have GPS coordinates set");
    }

    // Query members within radius using Haversine formula
    List<Object[]> results = memberRepository.findNearbyMembers(
        branch.getLatitude(),
        branch.getLongitude(),
        radiusKm
    );

    // Map raw results to DTOs
    List<NearbyMemberDTO> members = results.stream().map(row -> new NearbyMemberDTO(
        ((Number) row[0]).longValue(),    // id
        (String) row[1],                   // name
        (String) row[2],                   // surname
        (String) row[3],                   // residentialAddress
        (String) row[4],                   // cellNumber
        ((Number) row[5]).doubleValue(),   // distanceKm
        (String) row[6],                   // nationName
        (String) row[7]                    // branchName
    )).collect(Collectors.toList());

    return new NearbyMembersResponse(
        branch.getFullAddress(),
        branch.getLatitude(),
        branch.getLongitude(),
        members
    );
}
```

Make sure you import `java.util.stream.Collectors`.

---

## 7. Controller: `MemberController.java` — Add Endpoint

```java
@GetMapping("/nearby")
public ResponseEntity<?> getNearbyMembers(
    @RequestParam Long addressId,
    @RequestParam(defaultValue = "10") Double radiusKm
) {
    try {
        NearbyMembersResponse response = memberService.getNearbyMembers(addressId, radiusKm);
        return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
        if (e.getMessage().contains("GPS coordinates")) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("message", "Failed to fetch nearby members"));
    }
}
```

---

## 8. Security Config

Add to your `SecurityConfig.java` permitAll or authenticated section:

```java
.requestMatchers("/api/member/nearby").authenticated()
```

---

## 9. Registration Endpoint Update

In your existing registration logic (wherever `POST /api/member/register` is handled), make sure the `latitude` and `longitude` fields from the request body are saved to the member entity:

```java
// In your register method, after creating the Members object:
member.setLatitude(request.getLatitude());
member.setLongitude(request.getLongitude());
```

If you use a DTO for registration, add these fields:

```java
private Double latitude;
private Double longitude;
```

---

## 10. Database Migration (if needed)

If you use Flyway or Liquibase, add a migration:

```sql
-- Add latitude/longitude to members table
ALTER TABLE members ADD COLUMN latitude DOUBLE;
ALTER TABLE members ADD COLUMN longitude DOUBLE;

-- Add latitude/longitude to address table (branch locations)
ALTER TABLE address ADD COLUMN latitude DOUBLE;
ALTER TABLE address ADD COLUMN longitude DOUBLE;
```

If using JPA auto-DDL (`spring.jpa.hibernate.ddl-auto=update`), the columns will be created automatically.

---

## Summary

| What | Where | Purpose |
|------|-------|---------|
| `latitude`, `longitude` fields | `Members` entity | Store member GPS location |
| `latitude`, `longitude` fields | `Address` entity | Store branch GPS location |
| `NearbyMemberDTO` | `com.vyg.dto` | Response DTO per member |
| `NearbyMembersResponse` | `com.vyg.dto` | Full response wrapper |
| `findNearbyMembers()` | `MemberRepository` | Haversine SQL query |
| `getNearbyMembers()` | `MemberService` | Business logic |
| `GET /api/member/nearby` | `MemberController` | REST endpoint |

---

## API Contract

**Request:**
```
GET /api/member/nearby?addressId=1&radiusKm=10
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "branchAddress": "123 Church Street, Johannesburg, Gauteng",
  "branchLat": -26.2041,
  "branchLng": 28.0473,
  "members": [
    {
      "id": 42,
      "name": "Thabo",
      "surname": "Mokoena",
      "residentialAddress": "15 Gold Street, Johannesburg",
      "cellNumber": "0821234567",
      "distanceKm": 1.3,
      "nationName": "EXPLOSION",
      "branchName": "Soweto Branch"
    }
  ]
}
```

**Error (400):** Branch has no GPS coordinates set
```json
{ "message": "Branch does not have GPS coordinates set" }
```

---

## How the Frontend Uses This

1. **Registration (AddMember.js / AddUserBranch.js):** User picks location via GPS or address search → frontend sends `latitude`, `longitude` in the registration payload
2. **Nearby Members page:** Frontend calls `GET /api/member/nearby?addressId={branchId}&radiusKm={slider value}` → displays members sorted by distance with color-coded cards and a map

---

## Important Notes

- The Haversine formula calculates distance "as the crow flies" (straight line), not driving distance
- Members without lat/lng will NOT appear in nearby results (the WHERE clause filters them out)
- For existing members, you can batch-geocode their `residentialAddress` using the Nominatim API or manually add coordinates
- Branch coordinates must be set for the endpoint to work — otherwise it returns 400
- Consider adding an index on `(latitude, longitude)` for performance with large datasets


---

## 11. Additional Endpoint: Set Branch Coordinates

The frontend Nearby Members page has a setup flow — if a branch has no coordinates, it prompts the admin to search and set the branch location. This calls:

**Request:**
```
PUT /api/addresses/{id}/coordinates
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": -26.1438,
  "longitude": 27.8511
}
```

**Response (200 OK):**
```json
{
  "id": 36,
  "fullAddress": "CBC Roodepoort",
  "latitude": -26.1438,
  "longitude": 27.8511
}
```

### Controller code (in `AddressController.java`):

```java
@PutMapping("/{id}/coordinates")
public ResponseEntity<?> updateCoordinates(
    @PathVariable Long id,
    @RequestBody Map<String, Double> coords
) {
    Address address = addressRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Address not found"));

    address.setLatitude(coords.get("latitude"));
    address.setLongitude(coords.get("longitude"));
    addressRepository.save(address);

    return ResponseEntity.ok(address);
}
```

### Security Config:

```java
.requestMatchers(HttpMethod.PUT, "/api/addresses/*/coordinates").authenticated()
```

This only needs to be done once per branch. After the coordinates are set, the Nearby Members page will work normally.
