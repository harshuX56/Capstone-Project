import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Select, Space, Table, Typography } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import './App.css';

const { Title } = Typography;

function App() {
  const [data, setData] = useState([]);
  const [selectedState, setSelectedState] = useState(undefined);
  const [selectedDistrict, setSelectedDistrict] = useState(undefined);
  const [selectedVillage, setSelectedVillage] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/clean_village_data.json')
      .then((response) => response.json())
      .then((json) => {
        const normalized = json
          .map((item) => ({
            State: (item['STATE NAME'] || item.State || '').toString().trim(),
            District: (item['DISTRICT NAME'] || item.District || '').toString().trim(),
            SubDistrict: (item['SUB-DISTRICT NAME'] || item.SubDistrict || '').toString().trim(),
            Village: (item['Area Name'] || item.Village || '').toString().trim(),
          }))
          .filter((item) => item.State && item.District && item.SubDistrict && item.Village);

        setData(normalized);
      })
      .catch((error) => console.error('Error loading data:', error));
  }, []);

  const stateOptions = useMemo(
    () => [...new Set(data.map((item) => item.State))].sort(),
    [data],
  );

  const districtOptions = useMemo(() => {
    if (!selectedState) return [];
    return [...new Set(data.filter((item) => item.State === selectedState).map((item) => item.District))].sort();
  }, [data, selectedState]);

  const villageOptions = useMemo(() => {
    if (!selectedState || !selectedDistrict) return [];
    return [...new Set(
      data
        .filter((item) => item.State === selectedState && item.District === selectedDistrict)
        .map((item) => item.Village),
    )].sort();
  }, [data, selectedState, selectedDistrict]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesState = selectedState ? item.State === selectedState : true;
      const matchesDistrict = selectedDistrict ? item.District === selectedDistrict : true;
      const matchesVillage = selectedVillage ? item.Village === selectedVillage : true;
      const matchesSearch = searchTerm
        ? item.Village.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      return matchesState && matchesDistrict && matchesVillage && matchesSearch;
    });
  }, [data, selectedState, selectedDistrict, selectedVillage, searchTerm]);

  const columns = [
    { title: 'State', dataIndex: 'State', key: 'State' },
    { title: 'District', dataIndex: 'District', key: 'District' },
    { title: 'Sub-District', dataIndex: 'SubDistrict', key: 'SubDistrict' },
    { title: 'Village/Area Name', dataIndex: 'Village', key: 'Village' },
  ];

  return (
    <div className="app-shell">
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>🏘️ Village Data Viewer</Title>
      </div>
      <Card className="controls-card">
        <Space wrap size="middle" style={{ marginBottom: 16 }}>
          <Select
            placeholder="Select State"
            style={{ minWidth: 220 }}
            value={selectedState}
            onChange={(value) => {
              setSelectedState(value);
              setSelectedDistrict(undefined);
              setSelectedVillage(undefined);
            }}
            options={stateOptions.map((state) => ({ label: state, value: state }))}
            allowClear
          />

          <Select
            placeholder="Select District"
            style={{ minWidth: 220 }}
            value={selectedDistrict}
            onChange={(value) => {
              setSelectedDistrict(value);
              setSelectedVillage(undefined);
            }}
            disabled={!selectedState}
            options={districtOptions.map((district) => ({ label: district, value: district }))}
            allowClear
          />

          <Select
            placeholder="Select Village"
            style={{ minWidth: 220 }}
            value={selectedVillage}
            onChange={setSelectedVillage}
            disabled={!selectedDistrict}
            options={villageOptions.map((village) => ({ label: village, value: village }))}
            allowClear
          />

          <Button
            type="primary"
            danger
            icon={<ClearOutlined />}
            onClick={() => {
              setSelectedState(undefined);
              setSelectedDistrict(undefined);
              setSelectedVillage(undefined);
              setSearchTerm('');
            }}
            style={{ borderRadius: 8 }}
          >
            Reset All
          </Button>
        </Space>

        <Input
          placeholder="Search villages by name"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          style={{ width: '100%', maxWidth: 500, borderRadius: 8 }}
          allowClear
        />
      </Card>

      <Card className="table-card">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Text strong style={{ fontSize: 14 }}>
            📊 Showing {filteredData.length} of {data.length} villages
          </Typography.Text>
        </div>
        <Table
          size="middle"
          rowKey={(record, index) => `${record.State}-${record.District}-${record.SubDistrict}-${record.Village}-${index}`}
          dataSource={filteredData}
          columns={columns}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} rows` }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
}

export default App;
