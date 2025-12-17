import RNFS from 'react-native-fs';
import Share from 'react-native-share';


export const exportToCSV = async (rows: any[]) => {
if (!rows.length) return;


const header = Object.keys(rows[0]).join(',');


const csvRows = rows.map(row =>
Object.values(row)
.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
.join(',')
);


const csv = [header, ...csvRows].join('\n');


const path = `${RNFS.DownloadDirectoryPath}/visitors_${Date.now()}.csv`;


await RNFS.writeFile(path, csv, 'utf8');


await Share.open({
url: `file://${path}`,
type: 'text/csv',
filename: 'visitors.csv',
});
};