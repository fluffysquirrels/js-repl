(setg filter (func (elts pred)
		(if (null-or-empty-list? elts)
			'()
		(do
			(setl curr-elt (car elts))
			(setl get-rest (func ()
				(filter (cdr elts) pred)
			))
			(if (pred curr-elt)
				(cons curr-elt (get-rest))
				(get-rest)
			)
		))
	)
)

(setg map (func (elts map-func)
	(if (null-or-empty-list? elts)
		'()
	(cons
		(map-func (car elts))
		(map (cdr elts) map-func)
	))
))

(setg first-or-null
	(func (elts filter-func)
		(if (null-or-empty-list? elts)
			null
		(do
			(setl head (car elts))
			(if (filter-func head)
				head
				(first-or-null
					(cdr elts)
					filter-func))
		))
	)
)


(setg push
	(func (a-list elt)
		(if (null? a-list)
			(cons elt)
			(cons 	(car a-list)
					(push (cdr a-list) elt))
		)
	)
)


(do
  (setl reverse-int
    (func (a-list acc)
	  (if (null-or-empty-list? a-list)
        acc
		(reverse-int
		  (cdr a-list) 
		  (cons (car a-list) acc)
		)
      )
    )
  )
  (setg reverse
    (func (a-list)
      (reverse-int a-list '())
	) 
  )
)

