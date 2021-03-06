(add-type
  (new-type 'vec2
    (new-field 'x 'number)
    (new-field 'y 'number)
  )
)

(setg vec2.add
  (fn (v1 v2)
    (setl newx (+ (get-value v1 'x) (get-value v2 'x)))
    (setl newy (+ (get-value v1 'y) (get-value v2 'y)))
    (new-with-values-list 'vec2
      (list
		(list 'x newx)
        (list 'y newy)
	  )
    )
  ))

(setg vec2.len
  (fn (vec)
    (setl len-squared
      (+ (square (get-value vec 'x))
         (square (get-value vec 'y))
      ))

    (sqrt len-squared)
  ))
