import Flatpickr from "react-flatpickr";
import { useState } from "react";

const DatePicker = (props: {
  styles: string;
  includeTime: boolean;
  date?: Date;
  maxDate?: Date;
}) => {
  const { styles, includeTime, date, maxDate } = props;
  const [dateValue, setDate] = useState(new Date());

  const className =
    "inline-block flex-1 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" +
    styles;
  return (
    <Flatpickr
      className={className}
      value={dateValue}
      options={{ maxDate, enableTime: includeTime, noCalendar: false }}
      onChange={([date]) => {
        setDate(date);
      }}
    />
  );
};

export default DatePicker;
