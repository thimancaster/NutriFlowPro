<Calendar
  mode="single"
  selected={field.value}
  onSelect={field.onChange}
  disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
  initialFocus
  captionLayout="dropdown-buttons"
  fromYear={1920}
  toYear={new Date().getFullYear()}
/>
