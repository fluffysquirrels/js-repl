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

(setg append
	(func (list-1 list-2)
		(if (null-or-empty-list? list-1)
			list-2
			(cons
				(car list-1)
				(append (cdr list-1) list-2)
			)
		)
	))

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


(setg partition
	(func (a-list set1-predicate)
		(setl set2-predicate
			(func (elt) (not (set1-predicate elt))))

		(setl set1
			(filter a-list set1-predicate))
		(setl set2
			(filter a-list set2-predicate))

		(list set1 set2)
	))

(setg second
  (func (a-list)
    (car (cdr a-list))
  ))
