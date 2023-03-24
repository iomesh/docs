---
id: monitoring-iomesh
title: Monitoring IOMesh 
sidebar_label: Monitoring IOMesh 
---

After successfully importing Grafana, you will see the dashboard shown below. Refer to [Grafana Docs](https://grafana.com/docs/grafana/latest/dashboards/) to do more configurations and adjustments.

IOMesh provide 5 rows of contents for monitoring IOMesh storage: 

- Overview
- Node
- Details of Node
- Physical Disk
- Persistent Volume

### Overview 
Shows IOMesh cluster information and resource usage. See details in the following table:

|Field|Description|
|---|---|
|Alert|Shows all alarms detected in the IOMesh cluster, by default presenting essential details such as alarm names, trigger status, and duration. You can further investigate into the severity, reasons, impacts, and recommended solutions for each alarm, and set the threshold for alert rules on your own on the Alert page.|
|Cluster Info|Shows the basic information of the IOMesh cluster, including IOMesh version, IOMesh block storage version，CPU architecture, license type, license edition、maximum number of nodes, license expiration time.|
|Node|Shows the total number of nodes in the IOMesh cluster and how many of them are in the unhealthy state.|
|Physical Disk|Shows the number of total SSDs, total HDDs, unhealthy SSDs and unhealthy HDDs, respectively.|
|Persistent Volume| Shows the number of all PVs in the IOMesh cluster.|
|PV Status|Shows the number of PVs in different states in the IOMesh cluster.|
|Total Capacity|Shows the total capacity of the IOMesh cluster.|
|Used Capacity|Shows the used capacity of the IOMesh cluster.|
|Total Usage|Shows the percentage of used capacity to total capacity of the IOMesh cluster.|
|Data Migrate & Recovery|Shows the amount of data to be migrated and migration speed, or the amount of all data to be recovered and recovery speed.|
|Cluster IOPS|Shows the minimum, maximum and latest values of read, write and total IOPS for the IOMesh cluster in a given time period.|
|Cluster Average Latency|Shows the minimum, maximum, and latest values of read, write, and total average latency for the IOMesh cluster in a given time period, respectively.|
|Cluster I/O Average Block Size|Shows the minimum, maximum, and latest values of read, write, and total average latency for the IOMesh cluster in a given time period, respectively.|


展示 IOMesh 集群在指定时间段的读、写、总平均块大小的最小值/最大值/最新时间点的值。|
|Cluster I/O Bandwidth|展示 IOMesh 集群在指定时间段的读、写、总带宽的最小值/最大值/最新时间点的值。|

### Node
Shows the basic information of all nodes in the IOMesh cluster.

| Field | Description | Example |
|------|------|--------|
| Name          | The node name. | "node-1" |
| Namespace     | The node NameSpace. | "iomesh-system" |
| Health Status | Shows the node health status, including:<p>Initializing</p><p>Healthy</p><p>Error</p><p>Disconnected</p> | "Healthy"|
| Capacity      | Node 的总容量。                                                | “2 TiB”         |
| Space Usage   | Node 的空间使用率。                                            | “20%”           |
| Dirty Cache   | Node 中脏数据占的缓存空间。                                    | “5 GiB”         |
| Cache Hit     | Node 的读缓存命中率 * 读操作比例+写缓存命中率 * 写操作比例。   | “70%”           |
| Overall IOPS  | Node 的总 IOPS。                                               | “500 io/s”      |
| Avg Latency   | Node 的读写操作的平均延时。                                    | “1 us”          |
| Migrate       | Node 的数据迁移速度。                                          | “1000 B/s”      |
| Recovery      | Node 的数据恢复速度。                                          | “1000 B/s”      |

### Details of Node
展示当前 IOMesh 集群中指定节点的数据迁移与恢复、性能数据等信息。

| Field                       | Description                                                              | Example    |
|-----------------------------|--------------------------------------------------------------------------|------------|
| Pending Migrate             | The amount of data to be migrated on the node.                           | "50.0 MiB" |
| Pending Recover             | The amount of data to be recovered on the node.                          | "50.0 MiB" |
| Failure Cache               | The amount of unavailable cache space on the node.                       | "50.0 MiB" |
| Failure Data                | The amount of unavailable data space on the node.                        | "50.0 MiB" |
| Node IOPS                   | 展示 Node 在指定时间段的读、写 IOPS 的最小值/最大值/最新时间点的值。     | /          |
| Node Average Latency        | 展示 Node 在指定时间段的读、写平均延迟的最小值/最大值/最新时间点的值。   |            |
| Node I/O Average Block Size | 展示 Node 在指定时间段的读、写平均块大小的最小值/最大值/最新时间点的值。 |            |
| NodeI/O Bandwidth           | 展示 Node 在指定时间段的读、写带宽的最小值/最大值/最新时间点的值。       |            |

### Physical Disk
展示当前 IOMesh 集群中物理盘的属性信息、使用状态、用途和使用情况。

| Field              | Description                                                                                                                | Example        |
|--------------------|----------------------------------------------------------------------------------------------------------------------------|----------------|
| Device Name        | The physical disk name.                                                                                                    | "dev/sdv"      |
| Health Status      | Shows the health status of the physical disk, including: - Healthy - Unhealthy - Failing - S.M.A.R.T not passed            | "Healthy"      |
| Usage Status       | Shows if the usage status of the physical disk, including: - Unmounted - Partially mounted - Mounted - Staging - Migrating | "Mounted"      |
| Remaining Lifetime | Shows the remaining life of the cache disk. A higher percentage (%) value indicates a longer remaining life.               | "99%"          |
| Type               | Shows the disk type, including: - SSD - HDD                                                                                | "HDD"          |
| Model              | Shows disk attribute information, which may contain brand information.                                                     | "DL2400MM0159" |
| Serial Number      | The serial number of the physical disk.                                                                                    | "WBM3C4TE"     |
| Use                | Shows the purpose of the physical disk, including: - Datastore  - Cache with journal - Datastore with journal              | "Cache"        |
| Capacity           | The total capacity of the physical disk.                                                                                   | "500 GiB"      |
| Hostname           | The destination node name.                                                                                                 | "node-1"       |
### Persistent Volume
Shows PV attributes, status, and usage in the IOMesh cluster.

| Field|Description| Example|
|---|------|-----|
| Name | The PV name. | "Volume-1"            |
| StorageClass       | The StorageClass name corresponding to this PV. | "StorageClass1"       |
| Status | Shows the PV status, including: <p>Available: This PV is available for use but is not bound to any PVC. </p> <p>Bound: This PV is already bound to a PVC.</p><p>Released: All bound PVCs have been deleted but resources have been not recycled by the cluster.</p> <p>Failed: 自动回收卷失败.<p> Pending: This PV is already created but but needs to wait for CSI to create the entity storage resource. |"Provisioning"|
| Allocated Capacity | The logical capacity allocated to this PV.| "50 GiB"|
| Exclusive Capacity | PV 在存储层面独占的逻辑容量。 | "25 GiB"              |
| Shared Capacity | PV 和其他对象共享的物理容量。 | "10 GiB"              |
| VolumeMode| Shows PV VolumeMode, including: <p>Block</P><p>Filesystem</p>| "Block"               |
| PV Provisioning    | Shows the PV provisioning type, including: - Thin provisioning - Thick provisioning | "Thin provisioning"   |
| Replicas | The number of replicas for this PV.| “2/3”|
| Created Time | The time when this PV was created. | "2022-12-08 14:45:00"|
                                                                                                                                                                                                                                                                                                                                                                                     
