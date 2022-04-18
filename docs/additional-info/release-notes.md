---
id: release-notes
title: Release Notes
sidebar_label: Release Notes
---


## IOMesh 0.11.0

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
<li>Kubernetes v1.17~v1.21</li>
<li>OpenShift v3.11~v4.8</li>
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

### Download Links
IOMesh Offline Installation Package
* Download Links:
https://download.smartx.com/iomesh-offline-v0.11.0.tgz
* MD5: 25facf99281705129a9920bb899e43d2 



