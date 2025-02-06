import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";

const DatePicker = (props: {
  styles: string;
  hideDate: boolean;
  date: Date | null;
  minDate?: Date;
  maxDate?: Date;
  setDate: (date: Date) => void;
}) => {
  const { styles, hideDate, date, maxDate, minDate, setDate } = props;
  const className =
    "inline-block flex-1 rounded border-slate-400 p-1 focus:border-main dark:border-darkBorder dark:bg-darkBg dark:text-darkText" +
    styles;

  return (
    <Flatpickr
      className={className}
      value={date ?? undefined}
      placeholder="stream"
      options={{
        maxDate,
        minDate,
        enableTime: true,
        noCalendar: false,
        dateFormat: hideDate ? "H:i:S" : "Y-m-d H:i:S",
      }}
      onChange={([date]) => {
        setDate(date);
      }}
    />
  );
};

export default DatePicker;
