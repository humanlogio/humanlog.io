import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";

const DatePicker = (props: {
  styles: string;
  includeTime: boolean;
  date?: Date;
  maxDate?: Date;
  setDate: (date: Date) => void;
}) => {
  const { styles, includeTime, date, maxDate, setDate } = props;
  const className =
    "inline-block flex-1 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" +
    styles;

  return (
    <Flatpickr
      className={className}
      value={date}
      options={{ maxDate, enableTime: includeTime, noCalendar: false }}
      onChange={([date]) => {
        setDate(date);
      }}
    />
  );
};

export default DatePicker;
