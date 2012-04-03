(setg null-or-empty-list?
	(func (a-list)
		(or (null? a-list)
			(and
				(and
					(cons? a-list)
					(null? (car a-list))
				)
				(null? (cdr a-list))
			)
		)
	))

(setg list
	(func (*values)
		*values
	)
)

(setg eq
	(func (a b)
		(cond
			((not (sym= (jstypeof a) (jstypeof b)))
				false)
			((and (record? a) (record? b))
				(record= a b))
			((cons? a)
				(listeq a b))
			((sym? a)
				(sym= a b))
			(true
				(js= a b))
		)
	)
)

(setg listeq
	(func (a b) 
		(if (eq (car a) (car b))
			(if(eq (cdr a) null)
				(eq (cdr b) null)
				(if (eq (cdr b) null)
					false
					(listeq (cdr a) (cdr b))
				)
			)
			false
		)
	)
)

