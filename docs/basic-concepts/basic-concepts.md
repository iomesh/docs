---
id: basic-concepts
title: Basic Concepts
sidebar_label: Basic Concepts
---

Before deploying and using IOMesh, familiarity with the following concepts is suggested.

[**Kubernetes**](https://kubernetes.io/)

A portable, extensible open source container orchestration platform for managing containerized workloads and services, facilitating both declarative configuration and automation.

[**Node**](https://kubernetes.io/docs/concepts/architecture/nodes/)

A worker machine in Kubernetes that runs containerized workloads, which can be a virtual machine or a physical machine depending on the cluster. A Kubernetes node usually has two types of nodes: control plane nodes and worker nodes.

**Worker Node**

A worker machine that runs Kubernetes node components and containerized applications. IOMesh is installed, deployed, and running on the worker node. 

[**kubectl**](https://kubernetes.io/docs/reference/kubectl/)

A command line tool for communicating with the control plane of a Kubernetes cluster through the Kubernetes API.

**Stateful Application**

Applications can be stateful or stateless. A stateful application saves data to persistent disk storage for use by the server, client, and other applications while a stateless application does not save client data to the server when switching sessions.

[**CSI**](https://github.com/kubernetes-csi)

Container storage interface. A standard for exposing arbitrary block and file storage systems to containerized workloads on Container Orchestration Systems (COs) like Kubernetes.

**IOMesh Block Storage**

IOMesh block storage service for ensuring distributed system consistency and data coherence, managing metadata and local disks, and implementing I/O redirection and high availability.

**IOMesh CSI Driver**

The self-developed CSI driver that complies with the Kubernetes CSI standard, managing persistent volumes using RPC (Remote Procedure Call) for providing persistent storage for data applications running on Kubernetes. Each Kubernetes persistent volume corresponds to an iSCSI LUN in the IOMesh cluster.

**IOMesh Operator**

The IOMesh automated operations and maintenance component, allowing for roll updating IOMesh, scaling up or down nodes, and GitOps while being responsible for automatic discovery, allocation, and management of block devices.

[**Namespace**](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

Provides a mechanism for dividing resources in the same cluster into isolated groups that can be created on demand and managed separately within a cluster.

[**StorageClass**](https://kubernetes.io/docs/concepts/storage/storage-classes/)

Provides a way for administrators to describe the classes of storage they offer or a template for dynamically provisioning persistent volumes. 

[**Persistent Volume**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

A piece of storage in the cluster, which can be pre-provisioned by the administrator or dynamically provisioned using StorageClass. Persistent volumes, like other types of volumes, are implemented using volume plugins, but they have a lifecycle independent of any pod using PV. 

[**Persistent Volume Claim**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

A request for storage by a user. Conceptually similar to a pod, a pod consumes node resources while a PVC consumes PV resources; a pod can request a specific amount of resources like CPU and memory, and similarly a PVC can request a specific size of storage and access mode.

[**Volume Snapshot**](https://kubernetes.io/docs/concepts/storage/volume-snapshots/)

A user request for a snapshot of a volume, which is similar to a persistent volume request.

[**Volume Snapshot Class**](https://kubernetes.io/docs/concepts/storage/volume-snapshot-classes/)

Provides a way to describe the classes of storage when provisioning a volume snapshot. It allows you to specify different attributes belonging to a VolumeSnapshot. These attributes may differ among snapshots taken from the same volume on the storage system and therefore cannot be expressed by using the same StorageClass of a PersistentVolumeClaim.

[**Volume Snapshot Content**]((https://kubernetes.io/docs/concepts/storage/volume-snapshots/))

A snapshot taken from a volume in the cluster that has been provisioned by an administrator. It is a resource in the cluster just like a persistent volume is a cluster resource.

**Volume Mode**

An optional API parameter that describes the specific mode for a persistent volume. Kubernetes supports `Filesystem` and `Block` as `volumeModes`. 

- `filesystem`: A volume with volume mode set to `filesystem` is mounted to a directory by the pod.
- `block`: Use a volume as a raw block device which provides the pod the fastest possible way to access a volume, without any filesystem layer between the pod and the volume.

[**Access Mode**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)

A persistent volume can be mounted on a host in any way supported by the resource provider. The access modes supported by a persistent volume vary depending on the capabilities of the resource provider. 

- `ReadWriteOnce`: The volume can be mounted as read-write by a single node. ReadWriteOnce access mode still can allow multiple pods to access the volume when the pods are running on the same node.

- `ReadOnlyMany`: The volume can be mounted as read-only by many nodes.

- `ReadWriteMany`: The volume can be mounted as read-write by many nodes.

- `ReadWriteOncePod`: The volume can be mounted as read-write by a single pod. `ReadWriteOncePod`is suggested if you want to ensure that only one pod across the whole cluster can read that PVC or write to it. This is only supported for CSI volumes and Kubernetes version 1.22+.

IOMesh supports `ReadWriteOnce`，`ReadWriteMany`，and `ReadOnlyMany`, but `ReadWriteMany` and `ReadOnlyMany` are only for PVs with `volumemode` as Block.

[**Helm**](https://helm.sh/)

A package manager for Kubernetes that helps find, share, and build Kubernetes with software. You will need Helm when installing IOMesh.

[**Prometheus**](https://prometheus.io/)

An open source system monitoring and alerting toolkit that can be integrated with IOMesh to monitor IOMesh storage metrics and send instant alerts.

[**Grafana**](https://grafana.com/)

An open source analytics and interactive visualization web application, providing charts, graphs, and alerts for the web when connected to supported data sources. With Grafana, you can Grafana dashboard template and alerting rules provided by IOMesh to visualize IOMesh storage performance.




