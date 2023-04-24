---
id: release-notes
title: Release Notes
sidebar_label: Release Notes
---

## IOMesh 1.0.0 Release Notes

### What's in Release Notes

#### New Features
**Installation & Deployment**
- Adds support for Hygon x86_64 and Kunpeng AArch64 architectures to deploy IOMesh.
- Adds support for Kubernetes version 1.25.
- Adds support for deploying multiple IOMesh clusters within a single Kubernetes cluster.

**Storage**
- Allows for creating PVs using local storage like a directory or block device for pod use.
- Implements CSI typology awareness to schedule pods bound to PVs from IOMesh clusters to worker nodes holding their PVs.
- Triggers pod high availability when its worker node has a power outrage.


**Operations & Management**

- Detects abnormal disks and isolates them to minimize impact on system performance and reduce operational burden.

#### Improved Features

**Storage**
- Reduced IO interruption to within 22 seconds in case of node or network failure.
- Enhanced data integrity by allocating a temporary replica to hold newly written data after a replica is removed. 
- Enhanced data channel fault tolerance to prevent disconnection due to IO timeout.
- Optimized Lease Owner allocation mechanism to avoid IO failures due to network failures.
- Cleared the file lock created when executing `iscsiadm`, or else the CSI driver will be unavailable. 
- Simplified the configuration method for accessing IOMesh from outside its Kubernetes cluster, eliminating the need to create a separate Kubernetes service.
- Optimized the default CPU/memory resource limit setting for Pods to avoid Pods running slowly due to insufficient resources.

**Operations & Management**

- Added an alert panel on the IOMesh dashboard and display of information about cluster, physical disk and PV.

#### Resolved Issues

**Storage**

- Meta DB space become full after a snapshot of a large volume was taken, making the ZooKeeper unavailable. This issue has been resolved in this version.
- After the Chunk IP was changed, the data channel manager was unable to detect the new Chunk IP, resulting in data migration failure. The issue has been resolved in this version.

**Operations & Management**
- There might be pod resources left when uninstalling IOMesh via `Helm`. The issue has been resolved in this version.
  
### Specifications

| Component | Version|
| -------| -------|
|iomesh-operator|1.0.0|
| csi-driver| 2.6.0|
|zbs|5.3.0|
|zookeeper|3.5.9|
|node-disk-manager|1.8.0|
|hostpath-provisioner|0.5.3|

### Compatibility

#### Server Architecture Compatibility for IOMesh  

IOMesh is compatible with Intel x86_64 and Hygon x86_64 or Kunpeng AArch64 architectures.

#### Kubernetes and Linux OS Compatibility for IOMesh

<table>
<thead>
<tr class="header">
<th>Item</th>
<th>Version</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Kubernetes</td>
<td>
<ul>
<li>Kubernetes v1.17-v1.25</li>
<li>OpenShift v4.4-v4.12</li>
</ul></td>
</tr>
<tr class="even">
<td>Linux OS</td>
<td>
<ul>
<li>CentOS 7</li>
<li>CentOS 8</li>
<li>CoreOS</li>
<li>RHEL 7</li>
<li>RHEL 8</li>
<li>OpenEluer 22.03 LTS</li>
</tbody>
</table> 

>**Note**:
>
> IOMesh has no dependencies on the Linux OS version. The versions listed above are tested versions only.

## IOMesh 0.11.1 Release Notes

### What's New 

#### New Feature

Add support for Kubernetes versions 1.22 to 1.24.

#### Improved Features

- Optimized the method of clearing corresponding LUNs in IOMesh after deleting the PV with the reclaim policy set to **Retain**. 
- Improved the way of managing `open-iscsi` to ease IOMesh installation on various Linux distribution software. 
- Simplified Snapshot Controller installation. The Snapshot Controller will be installed together with IOMesh. 

#### Fixed Problems

- Fixed the problem that the name of `iscsi-redirectd daemonset` did not conform to the naming convention.
- Fixed the problem that the operations of SCSI-3 PR (Persistent Reservation) might fail due to non-compliance with the SCSI-3 PR protocol.
- Fixed the problem that the time to mount a disk was occasionally too long.
- Fixed the problem that configurations could not take effect when the user customized the NDM image repository.
- Fixed the problem that the number of cloned PV replicas or PV replicas created from a snapshot might be inconsistent with that of original PV replicas.

### Specifications

| Component | Version|
| -------| -------|
|iomesh-operator|0.11.1|
| csi-driver| 2.5.1|
|zbs|5.1.2|
|zookeeper|3.5.9|
|node-disk-manager|1.8.0|
|hostpath-provisioner|0.5.2|

### Compatibility

#### Server Architecture Compatibility for IOMesh  

IOMesh is compatible with Intel x86_64 and AMD x86_64 architectures.

#### Kubernetes and Linux OS Compatibility for IOMesh

<table>
<thead>
<tr class="header">
<th>Item</th>
<th>Version</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Kubernetes</td>
<td>
<ul>
<li>Kubernetes v1.17-v1.24</li>
<li>OpenShift v3.11-v4.10</li>
</ul></td>
</tr>
<tr class="even">
<td>Linux OS</td>
<td>
<ul>
<li>CentOS 7</li>
<li>CentOS 8</li>
<li>CoreOS</li>
<li>RHEL 7</li>
<li>RHEL 8</li>
</tbody>
</table> 

>**Note**:
>
> IOMesh has no dependencies on the Linux OS version. The versions listed above are tested versions only.

## Known Issues

- When multiple IOMesh clusters are deployed in the same Kubernetes cluster, the alarm information of all IOMesh clusters will be displayed in the alarm panel of the Grafana dashboard of any one of the IOMesh clusters.
- The Grafana dashboard cannot display the correct storage usage when the IOMesh cluster has invalid storage capacity.
- A PV whose volume mode is Block can still be written due to a Kubernetes code defect even if the access mode is ReadOnlyMany.
- 由于 ndm 机制缺陷，存在如下问题：
  - IOMesh 集群被卸载后，被 IOMesh 集群使用过的 blockdevice 对应的磁盘有小概率未被正确清理。
  - Device 类型的 IOMesh Local PV 被删除后，blockdevice 对应的磁盘有小概率未被正确清理。
  - Blockdevice 的状态有小概率在 active/inactive 之间来回切换，有时会导致无法挂载磁盘。
- IOMesh CR still shows disks of removed node after scaling down the chunk server.
- 对 IOMesh 集群执行 Chunk Server 缩容操作后，IOMesh cr 中仍会展示被缩容节点的磁盘。


## IOMesh 0.11.0 Release Notes

### What's New

#### New Features

##### Installation and Deployment

* Support deployment of the IOMesh cluster in the all-flash mode.
* Support deployment of the IOMesh cluster using the offline installation package.

##### Functionality

Support providing iSCSI storage services to the compute platforms disaggregated from the IOMesh cluster.

##### Operation

* Implement the NodeGetVolumeStas interface in CSI Spec and support PV monitoring with third-party monitoring platforms such as Prometheus.
* Support displaying the connection status of Chunk services.


#### Improved Features

* Declare reserved CPU and memory resources for IOMesh Operator, NDM, and Zookeeper Operator to ensure the QoS of their pods.
* Introduce Webhook to avoid unexpected parameter changes of clusters.
* Simplify IOMesh installation by improving the IOMesh deployment script.
* Optimize the license renewal method to update the license using the Kubernetes API. 
* Optimize the replica policy with only replication factor two or three is supported.
* Optimize the process of ZBS upgrade.
* Optimize the Liveness/Readyness probing methods of IOMesh pods to avoid false alarms due to high system load.


#### Resolved Issues

The issues listed below are resolved in this release.  
* NDM 1.7.x creates partitions for the disk by default when the WWID is not identified, causing the disk to be not mounted as cacheWithJournal or dataStoreWithJournal.
* The disk cannot be mounted when installing IOMesh Operator in the OpenShift Container Platform.
* The IOMesh system crashes because the loop device has been mounted by NDM.
* Probe cannot get the process status and causes a CrashLoop, as the process name has been modified.
* Memory leaks because Probe does not close RPC connections.
* Memory leaks due to ZBS Client not being freed.
* The newly created pods attached with PVCs time out when the number of pods attached with PVCs on a Kubernetes worker node exceeds 100.
* A timeout occurs when formatting a PV as an XFS file system, as the size of PV exceeds 5TB.
* The disk cannot be mounted while device manager logs show messages of successful mounting.

#### Known Issues 

* Replica factor of PVs by CSI volume cloning may not be consistent with original PVs.

### Specifications

|Component|Version|
|--|--|
|iomesh-operator|0.11.0|
|csi-driver|2.4.0|
|zbs|5.2.0|
|zookeeper|3.5.9|
|node-disk-manager|1.8.0|
|hostpath-provisioner|0.5.2

### Compatibility

IOMesh supports servers running on Intel x86_64 and AMD x86_64 architectures.

IOMesh Compatibility 
<table>
<thead>
<tr class="header">
<th>Software/OS</th>
<th>Compatible Version</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Kubernetes</td>
<td>
<ul>
<li>Kubernetes v1.17-v1.21</li>
<li>OpenShift v3.11-v4.8</li>
</ul></td>
</tr>
<tr class="even">
<td>Linux OS</td>
<td>
<ul>
<li>CentOS 7</li>
<li>CentOS 8</li>
<li>CoreOS</li>
<li>RHEL 7</li>
<li>RHEL 8</li>
</tbody>
</table> 
