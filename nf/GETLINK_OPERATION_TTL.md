# Getlink operation TTL

Getlink operations now contain a Firestore timestamp field named
`operationExpiresAt`, set to seven days after creation. Enable a Firestore TTL
policy once in Google Cloud Console so completed, failed, and cancelled jobs are
removed automatically.

1. Open **Firestore Database** for project `trada3k-c402a`.
2. Open **Time-to-live (TTL)** and create a policy.
3. Select collection group **`items`**.
4. Set the TTL field to **`operationExpiresAt`**.
5. Enable the policy.

Only getlink operation documents include `operationExpiresAt`; share links,
cookies, history, limits, and other `items` documents do not include that field
and will not be deleted by this policy. Firestore performs TTL deletion in the
background, so deletion can occur later than the precise expiry timestamp.
