;; BikeDAO Token Contract for Stacks
;; A fungible token for the bike sharing platform

;; Define the fungible token
(define-fungible-token ride-token)

;; Define constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-invalid-amount (err u103))

;; Define data variables
(define-data-var token-name (string-ascii 32) "RIDE Token")
(define-data-var token-symbol (string-ascii 10) "RIDE")
(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var total-supply uint u0)

;; Define maps
(define-map authorized-minters principal bool)

;; Authorization functions
(define-public (add-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set authorized-minters minter true))
  )
)

(define-public (remove-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set authorized-minters minter false))
  )
)

;; Check if address is authorized minter
(define-read-only (is-minter (address principal))
  (default-to false (map-get? authorized-minters address))
)

;; Token functions
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (or (is-eq tx-sender contract-owner) (is-minter tx-sender)) err-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-mint? ride-token amount recipient))
    (var-set total-supply (+ (var-get total-supply) amount))
    (ok true)
  )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) err-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-transfer? ride-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-public (burn (amount uint) (owner principal))
  (begin
    (asserts! (or (is-eq tx-sender owner) (is-eq contract-caller owner)) err-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-burn? ride-token amount owner))
    (var-set total-supply (- (var-get total-supply) amount))
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance ride-token who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply ride-token))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Initialize with some tokens for the contract owner
(begin
  (try! (ft-mint? ride-token u1000000 contract-owner))
  (var-set total-supply u1000000)
)