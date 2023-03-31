---
id: monitoring-iomesh
title: Monitor IOMesh 
sidebar_label: Monitor IOMesh 
---

After successfully importing Grafana, you will see the dashboard shown below. Refer to [Grafana Docs](https://grafana.com/docs/grafana/latest/dashboards/) to do more configurations and adjustments.

![image](https://user-images.githubusercontent.com/102718816/228129444-c656ab7f-9a1c-4c58-ba6d-9dcfa7846b7a.png)


IOMesh provide 5 rows of contents for monitoring IOMesh storage: 

- Overview
- Node
- Details of Node
- Physical Disk
- Persistent Volume

## Overview 
Shows IOMesh cluster information and resource usage. 

|Panel|Description|
|---|---|
|Alert|Shows all alarms detected in the IOMesh cluster, by default presenting essential details such as alarm names, trigger status, and duration. You can further investigate into the severity, reasons, impacts, and recommended solutions for each alarm, and set the threshold for alert rules on your own on the Alert page.|
|Cluster Info|Shows the basic information of the IOMesh cluster, including IOMesh version, IOMesh block storage version, CPU architecture, license type, license edition, maximum number of nodes, and license expiration time.|
|Node|Shows the total number of nodes in the IOMesh cluster and how many of them are in the unhealthy state.|
|Physical Disk|Shows the number of total SSDs, total HDDs, unhealthy SSDs and HDDs, respectively.|
|Persistent Volume| Shows the total number of all persistent volumes in the IOMesh cluster.|
|PV Status|Shows the number of persistent volumes in different states in the IOMesh cluster.|
|Total Capacity|Shows the total capacity of the IOMesh cluster.|
|Used Capacity|Shows the used capacity of the IOMesh cluster.|
|Total Usage|Shows the percentage of used capacity to total capacity of the IOMesh cluster.|
|Data Migrate & Recovery|Shows the amount of data to be migrated and migration speed, or the amount of all data to be recovered and recovery speed.|
|Cluster IOPS|Shows the minimum, maximum and latest values of read, write and total IOPS for the IOMesh cluster in a given time period, respectively.|
|Cluster Average Latency|Shows the minimum, maximum, and latest values of read, write, and total average latency for the IOMesh cluster in a given time period, respectively.|
|Cluster I/O Average Block Size|Shows the minimum, maximum, and latest values of read, write, and total average block size for the IOMesh cluster in a given time period, respectively.|
|Cluster I/O Bandwidth|Shows the minimum, maximum, and latest values of read, write, and total bandwidth for the IOMesh cluster in a given time period, respectively.|

## Node
Shows the basic information of each node in the IOMesh cluster.

| Field | Description | Example |
|------|------|--------|
| Name          | The node name. | "node-1" |
| Namespace     | The namespace where the node is located. | "iomesh-system" |
| Health Status | Shows the node health status, including `Initializing`, `Healthy`, `Error`, and `Disconnected`.</p> | "Healthy"|
|Capacity | The total capacity of the node.| "2 TiB" |
| Space Usage | The space usage of the node. | "20%"    |
| Dirty Cache   | The dirty data space of the node.| "5 GiB"|
| Cache Hit     | Node read cache hit ratio * read ratio + write cache hit ratio * write ratio.   | "70%" |
| Overall IOPS  |The total IOPS of the node.  | "500 io/s" |
| Avg Latency   | The average read and write latency of the node. | "1 us"   |
| Migrate       | The data migration speed for the node.  | "1000 B/s"|
| Recovery      | The data recovery speed for the node.| "1000 B/s"|

## Details of Node
Shows data migration, recovery, and performance data of a specific node in the IOMesh cluster.

| Field | Description  | Example    |
|---|------|------------|
| Pending Migrate             | The amount of data to be migrated on the node.                           | "50.0 MiB" |
| Pending Recover             | The amount of data to be recovered on the node.                          | "50.0 MiB" |
| Failure Cache               | The amount of unavailable cache space on the node.                       | "50.0 MiB" |
| Failure Data                | The amount of unavailable data space on the node.                        | "50.0 MiB" |
| Node IOPS                   | Shows the minimum, maximum, and latest values of read write IOPS in a given time period.  | /          |
| Node Average Latency        | Shows the minimum, maximum, and latest values of read write average latency in a given time period. |     /       |
|Node I/O Average Block Size| Shows the minimum, maximum, and latest values of read write average block size in a given time period.|/|
| Node I/O Bandwidth|Shows the minimum, maximum, and latest values of read write bandwidth in a given time period.|/|

## Physical Disk
Shows disk attribute information, health and usage status, and purpose of use. 

| Field              | Description      | Example        |
|--------------------|------------------|----------------|
| Device Name        | The physical disk name. | "dev/sdv"      |
| Health Status      | Shows the health status of the physical disk, including ` Healthy`, `Unhealthy`, `Failing`, and `S.M.A.R.T not passed`.    | "Healthy"      |
| Usage Status       | Shows if the usage status of the physical disk, including `Unmounted`, `Partially mounted`, `Mounted`, `Staging`, and `Migrating`. | "Mounted"      |
| Remaining Lifetime | Shows the remaining life of the cache disk. A higher percentage (%) value indicates a longer remaining life.               | "99%"          |
| Type               | Shows the disk type, including `SSD` and `HDD`.       | "HDD"          |
| Model              | Shows disk attribute information, which may contain brand information.                                                     | "DL2400MM0159" |
| Serial Number      | The serial number of the physical disk.                                                                                    | "WBM3C4TE"     |
| Use                | Shows the purpose of the physical disk, including `Datastore`, `Cache with journal`, and `Datastore with journal`. | "Datastore"        |
| Capacity | The total capacity of the physical disk. | "500 GiB"      |
| Hostname| The name of the node where the disk is located. | "node-1"       |
## Persistent Volume
Shows PV attribute information, status, and usage in the IOMesh cluster.

| Field|Description| Example|
|---|------|-----|
| Name | The PV name. | "Volume-1"            |
| StorageClass       | The StorageClass name corresponding to this PV. | "StorageClass1"       |
| Status | Shows the PV status, including: <p><ul><li>Available: This PV is available for use but is not bound to any PVC.</li><li>Bound: This PV is already bound to a PVC.</li><li>Released: The PVC bound to this PV has been deleted, but the resource has not been reclaimed by the cluster.</li><li>Failed: Failed to automatically reclaim this PV.</li><li> Pending: This PV is already created but needs to wait for CSI to create the entity storage resource.</li></ul> |"Available"|
| Allocated Capacity | The logical capacity allocated to this PV.| "50 GiB"|
| Exclusive Capacity | The logical capacity exclusive for this PV.| "25 GiB" |
| Shared Capacity | The physical capacity shared by this PV and other objects. | "10 GiB"|
| VolumeMode| Shows PV VolumeMode, including `Block` and `Filesystem`.| "Block"               |
| PV Provisioning    | Shows the PV provisioning type, including `Thin provisioning` and `Thick provisioning`. | "Thin provisioning"   |
| Replicas | The number of replicas for this PV, including `2` or `3`|"2"|
| Created Time | The time when this PV was created. | "2022-12-08 14:45:00"|
                                                                                                                                                                                                                                                                                                                                                                                     