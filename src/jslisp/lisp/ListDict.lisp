(do
  (setg ListDict.new
    (func (*optional-initial-values)
	  (if (null-or-empty-list? *optional-initial-values)
        '(dict)
		(ListDict.with-values
		  (ListDict.new)
		  (car *optional-initial-values))
	  )
	))
  (setg ListDict.is?
    (func (obj)
      (cond
        ((not (cons? obj)) false)
        ((not (sym? (car obj))) false)
        ((not (sym= (car obj) 'dict)) false)
        (true true)
      )
	))
  (setg ListDict.has?
    (func (ldict key)
	  (setl value
	    (ListDict.tryget ldict key))
	  (not (null? value))
	))
  (setg ListDict.get
    (func (ldict key)
	  (setl value
	    (ListDict.tryget ldict key))
	  (if (null? value)
	    throw-keyNotFoundException
        value
	  )
	))
  (do
	(setg ListDict.tryget
      (func (ldict key)
	    (tryget-int (cdr ldict) key)
      ))
	(setl tryget-int
	  (func (pairs key)
	    (if (null-or-empty-list? pairs)
		  null
		  (let (curr-pair (car pairs))
	        (if (sym= (car curr-pair) key)
	          (second curr-pair)
		  	  (tryget-int (cdr pairs) key)
			)
		  )
		)
	  ))
  )
  (setg ListDict.keys
    (func (ldict)
      (setl pairs (cdr ldict))
	  (map pairs car)
	))
  (setg ListDict.with-value
    (func (ldict key value)
	  (setl pairs (cdr ldict))
      (setl unmodified-pairs
	  	(filter
	  	  pairs
	        (func (pair)
			  (not
		        (sym= (car pair) key)
			  ))
		))
      (setl new-pair (list key value))

	  (cons 'dict (cons new-pair unmodified-pairs))
	))
  (setg ListDict.with-values
    (func (ldict kv-pairs)
	  (if (null-or-empty-list? kv-pairs)
	    ldict
		(do
		  (setl curr-kv-pair (car kv-pairs))
		  (setl curr-key (car curr-kv-pair))
		  (setl curr-value (second curr-kv-pair))
		  (ListDict.with-values
		    (ListDict.with-value ldict curr-key curr-value)
		    (cdr kv-pairs)
		  )
		)
	  )
	))
)

