;; BikeSharing System Contract
;; A community-owned bike sharing system with maintenance tracking and usage incentives

;; Define the contract
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-bike-not-available (err u101))
(define-constant err-bike-already-rented (err u102))
(define-constant err-bike-not-rented (err u103))
(define-constant err-insufficient-deposit (err u104))
(define-constant err-invalid-bike-id (err u105))
(define-constant err-maintenance-required (err u106))

;; Bike data structure
(define-data-var total-bikes uint u0)
(define-data-var available-bikes uint u0)
(define-data-var total-rentals uint u0)
(define-data-var total-revenue uint u0)

;; Bike tracking maps
(define-map bike-status uint (tuple (is-available bool) (current-renter (optional principal)) (rental-start uint) (maintenance-count uint)))
(define-map user-rentals principal (list uint))
(define-map user-deposits principal uint)
(define-map bike-maintenance-history uint (list (tuple (timestamp uint) (description (string-ascii 100)))))

;; Initialize the contract with initial bikes
(define-public (initialize (initial-bike-count uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> initial-bike-count u0) err-invalid-bike-id)
    (var-set total-bikes initial-bike-count)
    (var-set available-bikes initial-bike-count)
    (ok true)))

;; Function 1: Rent a bike
(define-public (rent-bike (bike-id uint) (deposit-amount uint))
  (begin
    (asserts! (>= bike-id u1) err-invalid-bike-id)
    (asserts! (<= bike-id (var-get total-bikes)) err-invalid-bike-id)
    (asserts! (>= deposit-amount u1000) err-insufficient-deposit) ;; Minimum 1000 microSTX deposit
    
    ;; Check if bike is available
    (let ((bike-info (unwrap! (map-get? bike-status bike-id) err-bike-not-available)))
      (asserts! (get is-available bike-info) err-bike-already-rented)
      
      ;; Process STX deposit
      (try! (stx-transfer? deposit-amount tx-sender (as-contract tx-sender)))
      
      ;; Update bike status
      (map-set bike-status bike-id 
               (tuple 
                 (is-available false)
                 (current-renter (some tx-sender))
                 (rental-start (block-height))
                 (get maintenance-count bike-info)))
      
      ;; Update user rentals
      (let ((current-rentals (default-to (list) (map-get? user-rentals tx-sender))))
        (map-set user-rentals tx-sender (append current-rentals (list bike-id))))
      
      ;; Update user deposits
      (map-set user-deposits tx-sender 
               (+ (default-to u0 (map-get? user-deposits tx-sender)) deposit-amount))
      
      ;; Update contract state
      (var-set available-bikes (- (var-get available-bikes) u1))
      (var-set total-rentals (+ (var-get total-rentals) u1))
      
      (ok (tuple 
            (bike-id bike-id)
            (renter tx-sender)
            (deposit deposit-amount)
            (start-time (block-height))))))

;; Function 2: Return a bike with maintenance tracking
(define-public (return-bike (bike-id uint) (maintenance-notes (optional (string-ascii 100))))
  (begin
    (asserts! (>= bike-id u1) err-invalid-bike-id)
    (asserts! (<= bike-id (var-get total-bikes)) err-invalid-bike-id)
    
    ;; Check if bike is currently rented
    (let ((bike-info (unwrap! (map-get? bike-status bike-id) err-bike-not-available)))
      (asserts! (not (get is-available bike-info)) err-bike-not-rented)
      
      ;; Check if caller is the current renter
      (let ((current-renter (unwrap! (get current-renter bike-info) err-bike-not-rented)))
        (asserts! (is-eq tx-sender current-renter) err-bike-not-rented)
        
        ;; Calculate rental duration and fees
        (let ((rental-duration (- (block-height) (get rental-start bike-info)))
              (rental-fee (* rental-duration u10)) ;; 10 microSTX per block
              (user-deposit (unwrap! (map-get? user-deposits tx-sender) u0))
              (refund-amount (- user-deposit rental-fee)))
          
          ;; Update bike status
          (map-set bike-status bike-id 
                   (tuple 
                     (is-available true)
                     (current-renter none)
                     (rental-start u0)
                     (get maintenance-count bike-info)))
          
          ;; Add maintenance notes if provided
          (match maintenance-notes
            notes (let ((maintenance-entry (tuple (timestamp (block-height)) (description notes)))
                    (let ((current-history (default-to (list) (map-get? bike-maintenance-history bike-id)))
                          (map-set bike-maintenance-history bike-id (append current-history (list maintenance-entry)))))
                  ())
          
          ;; Update user rentals
          (let ((current-rentals (unwrap! (map-get? user-rentals tx-sender) (list))))
            (map-set user-rentals tx-sender (filter (fn (x) (not (is-eq x bike-id))) current-rentals)))
          
          ;; Update user deposits
          (map-set user-deposits tx-sender u0)
          
          ;; Update contract state
          (var-set available-bikes (+ (var-get available-bikes) u1))
          (var-set total-revenue (+ (var-get total-revenue) rental-fee))
          
          ;; Refund remaining deposit
          (try! (stx-transfer? refund-amount (as-contract tx-sender) tx-sender))
          
          (ok (tuple 
                (bike-id bike-id)
                (renter tx-sender)
                (rental-duration rental-duration)
                (rental-fee rental-fee)
                (refund refund-amount)))))))

;; Read-only functions for contract information
(define-read-only (get-bike-status (bike-id uint))
  (ok (map-get? bike-status bike-id)))

(define-read-only (get-user-rentals (user principal))
  (ok (map-get? user-rentals user)))

(define-read-only (get-user-deposit (user principal))
  (ok (map-get? user-deposits user)))

(define-read-only (get-contract-stats)
  (ok (tuple 
        (total-bikes (var-get total-bikes))
        (available-bikes (var-get available-bikes))
        (total-rentals (var-get total-rentals))
        (total-revenue (var-get total-revenue)))))

(define-read-only (get-bike-maintenance-history (bike-id uint))
  (ok (map-get? bike-maintenance-history bike-id)))