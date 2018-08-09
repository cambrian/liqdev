[%%version 0.36] 

let%init storage = 0

let%entry main (parameter : unit) (storage : int) =
  (([]: operation list), storage + 1)
