---
id: basic-concepts
title: Basic Concepts
sidebar_label: Basic Concepts
---

Before deploying and using IOMesh, familiarity with the following concepts is suggested.

[**Kubernetes**](https://kubernetes.io/)

A portable, extensible open source container orchestration platform for managing containerized workloads and services, facilitating both declarative configuration and automation.

[**Master Node**](https://kubernetes.io/docs/concepts/overview/components/#control-plane-components)

A node that runs the control plane components of the Kubernetes cluster and manages a set of worker nodes. Typically, a Kubernetes cluster has one, three, or five master nodes. 

**Worker Node**

A worker machine that runs Kubernetes node components and containerized applications. IOMesh is installed, deployed, and running on the worker node. 

[**kubectl**](https://kubernetes.io/docs/reference/kubectl/)

A command line tool for communicating with the control plane of a Kubernetes cluster through the Kubernetes API.

**Stateful Application**

Applications can be stateful or stateless. Stateful applications store data on persistent disk storage for use by the server, client, and other applications. Stateless applications do not store client data on the server when switching sessions.

**IOMesh Block Storage**

The IOMesh block storage service for ensuring distributed system consistency and data coherence, managing metadata and local disks, and implementing I/O redirection and high availability.

**IOMesh Node**

A worker node in the Kubernetes cluster with a chunk pod installed.

**Chunk**

The chunk module within each IOMesh Block Storage component that manages local disks, translates access protocols, and ensures data consistency. A chunk pod on a worker node provides storage services, and each worker node can only have one chunk pod.


**Meta**

The meta module within each IOMesh Block Storage component for metadata management, including storage object management, data replica management, access control, and ensuring data consistency. A meta pod on a worker node provides metadata management, and each worker node can only have one meta pod.

**IOMesh CSI Driver**

The CSI driver that adheres to [the CSI standard](https://github.com/container-storage-interface/spec/blob/master/spec.md) and utilizes RPC (Remote Procedure Call)  to manage persistent volumes, delivering reliable and consistent storage for data applications on Kubernetes. Each Kubernetes persistent volume corresponds to an iSCSI LUN in the IOMesh cluster.

**IOMesh Operator**

The IOMesh automated operations and maintenance component, allowing for roll updating IOMesh, scaling out or down nodes, and GitOps while being responsible for automatic discovery, allocation, and management of block devices.

[**Namespace**](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

Provides a mechanism for dividing resources in the same cluster into isolated groups that can be created on demand and managed separately within a cluster.

[**StorageClass**](https://kubernetes.io/docs/concepts/storage/storage-classes/)

Provides a way to describe the classes of storage or a template for dynamically provisioning persistent volumes and allows administrators to specify different attributes belonging to a StorageClass.

[**Persistent Volume**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

A piece of storage in the cluster, which can be pre-provisioned by the administrator or dynamically provisioned using StorageClass. Persistent volumes, like other types of volumes, are implemented using volume plugins, but they have a lifecycle independent of any pod using PV. 

[**Persistent Volume Claim**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

A request for storage by a user. Conceptually similar to a pod, a pod consumes node resources while a PVC consumes PV resources; a pod can request a specific amount of resources like CPU and memory, and similarly a PVC can request a specific size of storage and access mode.

[**Volume Snapshot**](https://kubernetes.io/docs/concepts/storage/volume-snapshots/)

A user request for a snapshot of a volume, which is similar to a persistent volume request.

[**Volume Snapshot Class**](https://kubernetes.io/docs/concepts/storage/volume-snapshot-classes/)

Provides a way to describe the classes of storage when provisioning a volume snapshot. It allows you to specify different attributes belonging to a VolumeSnapshot. These attributes may differ among snapshots taken from the same volume on the storage system and therefore cannot be expressed by using the same StorageClass of a PersistentVolumeClaim.

[**Volume Snapshot Content**](https://kubernetes.io/docs/concepts/storage/volume-snapshots/#volume-snapshot-contents)

A snapshot taken from a volume in the cluster that has been provisioned by an administrator. It is a resource in the cluster just like a persistent volume is a cluster resource.

[**Volume Mode**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#volume-mode)

An optional API parameter that describes the specific mode for a persistent volume. Kubernetes supports `Filesystem` and `Block` as `volumeModes`. 

- `filesystem`: A volume with volume mode set to `filesystem` is mounted to a directory by the pod.
- `block`: A volume is used as a raw block device which provides the pod the fastest possible way to access a volume, without any filesystem layer between the pod and the volume.

[**Access Mode**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)

A PV can be mounted on a host using any supported access mode. IOMesh supports `ReadWriteOnce`, `ReadWriteMany`, and `ReadOnlyMany` access modes; however, `ReadWriteMany` and `ReadOnlyMany` are only available for PVs that use `block` as the volume mode.

- `ReadWriteOnce`: The volume can be mounted as read-write by a single node. `ReadWriteOnce` still can allow multiple pods to access the volume when the pods are running on the same node.

- `ReadWriteMany`: The volume can be mounted as read-write by many nodes.

- `ReadOnlyMany`: The volume can be mounted as read-only by many nodes.

[**Helm**](https://helm.sh/)

A package manager for Kubernetes that helps find, share, and build Kubernetes with software. It is necessary to have Helm for IOMesh installation.

[**Prometheus**](https://prometheus.io/)

An open source system monitoring and alerting toolkit that can be integrated with IOMesh to help you monitor IOMesh storage metrics in real-time and receive immediate alerts.

[**Grafana**](https://grafana.com/)

A web application that offers real-time charts, graphs, and alerts when connected to supported data sources. It is open source and can import IOMesh dashboard template and alerting rules, allowing you to visualize IOMesh storage metrics.






